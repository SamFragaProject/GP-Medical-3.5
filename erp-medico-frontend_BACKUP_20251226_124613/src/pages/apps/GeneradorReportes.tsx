import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Patient } from '../../data/reportes/patients';
import MedicalReport from '../../components/apps/reportes/MedicalReport';
import FileUpload from '../../components/apps/reportes/FileUpload';
import { extractPatientNameFromPdf, generateAllAiContent, normalizeString } from '../../services/apps/geminiReportes';
import { mockDataService } from '@/services/mockDataService';

const GeneradorReportes: React.FC = () => {
    const [selectedPatientId, setSelectedPatientId] = useState<string | number | null>(null);
    const [currentPatientData, setCurrentPatientData] = useState<Patient | null>(null);
    const [labPdf, setLabPdf] = useState<File | null>(null);
    const [audiometryPdf, setAudiometryPdf] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [allPatients, setAllPatients] = useState<Patient[]>([]);

    useEffect(() => {
        const fetchPatients = async () => {
            try {
                // Simulate current user - in a real app, use AuthContext
                const currentUser = { role: 'super_admin' as const, id: 'admin', empresa_id: 'demo' };
                const data = await mockDataService.getPacientes(currentUser);

                const mappedPatients: Patient[] = data.map(p => ({
                    id: p.id, // ID is string from mockDataService
                    fullName: `${p.nombre} ${p.apellido_paterno} ${p.apellido_materno || ''}`.trim(),
                    dob: p.fecha_nacimiento,
                    physicalExamSummary: '',
                    vitals: { height: '', weight: '', satO2: '', fc: '', ta: '', fr: '', temp: '' },
                    personalInfo: {
                        birthPlace: '',
                        civilStatus: '',
                        education: '',
                        phone: p.telefono || '',
                        gender: p.genero === 'masculino' ? 'Masculino' : p.genero === 'femenino' ? 'Femenino' : p.genero
                    },
                    employmentInfo: {
                        position: p.puesto_trabajo?.nombre || '',
                        startDate: p.fecha_ingreso || '',
                        evaluationType: 'Periódica',
                        jobAnalysis: { description: '', riskFactors: [] }
                    },
                    medicalHistory: { hereditary: '', pathological: '', surgeries: '', epp: '', toxicHabits: '', others: '', allergies: '' },
                    labResults: {
                        hematology: { biometria: '', quimica: '', perfilHepatico: '', ego: '', audiometria: '' },
                        renal: { electrolitos: '', microalbuminuria: '', creatininaOrina: '', acr: '', tfg: '' }
                    },
                    diagnoses: [],
                    professionalDiseaseSuspicion: '',
                    aptitudeConcept: '',
                    recommendations: []
                }));
                setAllPatients(mappedPatients);
            } catch (error) {
                console.error("Error fetching patients:", error);
            }
        };
        fetchPatients();
    }, []);

    const handlePatientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        // Try to parse as number if possible, otherwise keep as string
        const patientId = isNaN(Number(val)) ? val : Number(val);
        setSelectedPatientId(patientId);
        setCurrentPatientData(null); // Clear previous report
        setError(null);
    };

    const handleGenerateReport = async () => {
        if (!selectedPatientId) {
            alert('Por favor, seleccione un paciente de la lista.');
            return;
        }
        if (!labPdf) {
            alert('Por favor, sube primero el archivo de laboratorios.');
            return;
        }

        setIsLoading(true);
        setError(null);

        const selectedPatient = allPatients.find(p => p.id == selectedPatientId); // Loose equality for string/number match
        if (!selectedPatient) {
            alert('Error: No se pudo encontrar al paciente seleccionado.');
            setIsLoading(false);
            return;
        }

        try {
            const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
            if (!apiKey) {
                throw new Error("API Key no encontrada.");
            }
            const ai = new GoogleGenAI({ apiKey });

            // Optional: Verify PDF name matches selected patient
            const extractedName = await extractPatientNameFromPdf(ai, labPdf);
            const normalizedExtractedName = normalizeString(extractedName);
            const normalizedSelectedName = normalizeString(selectedPatient.fullName);

            if (!normalizedSelectedName.includes(normalizedExtractedName) && !normalizedExtractedName.includes(normalizedSelectedName)) {
                console.warn(`Advertencia: El nombre en el PDF ("${extractedName}") podría no coincidir con el paciente seleccionado ("${selectedPatient.fullName}"). Se continuará con el paciente seleccionado.`);
            }

            const allAiData = await generateAllAiContent(ai, selectedPatient, labPdf, audiometryPdf);

            const patientInProgress = {
                ...selectedPatient,
                dob: allAiData.patientDetails?.dob || selectedPatient.dob,
                personalInfo: {
                    ...selectedPatient.personalInfo,
                    gender: allAiData.patientDetails?.gender || selectedPatient.personalInfo.gender,
                    civilStatus: allAiData.patientDetails?.civilStatus || selectedPatient.personalInfo.civilStatus,
                    education: allAiData.patientDetails?.education || selectedPatient.personalInfo.education,
                },
                vitals: {
                    height: allAiData.patientDetails?.height || selectedPatient.vitals.height,
                    weight: allAiData.patientDetails?.weight || selectedPatient.vitals.weight,
                    ta: allAiData.patientDetails?.ta || selectedPatient.vitals.ta,
                    fc: allAiData.patientDetails?.fc || selectedPatient.vitals.fc,
                    fr: allAiData.patientDetails?.fr || selectedPatient.vitals.fr,
                    temp: allAiData.patientDetails?.temp || selectedPatient.vitals.temp,
                    satO2: allAiData.patientDetails?.satO2 || selectedPatient.vitals.satO2,
                },
                labResults: {
                    hematology: { ...allAiData.labResults.hematology, audiometria: allAiData.audioSummary },
                    renal: allAiData.labResults.renal,
                },
                employmentInfo: {
                    ...selectedPatient.employmentInfo,
                    jobAnalysis: {
                        ...selectedPatient.employmentInfo.jobAnalysis,
                        description: allAiData.jobAnalysis,
                    }
                },
                physicalExamSummary: allAiData.physicalExamSummary,
                diagnoses: allAiData.diagnoses,
                professionalDiseaseSuspicion: allAiData.professionalDiseaseSuspicion,
                aptitudeConcept: allAiData.aptitude.aptitudeConcept,
                recommendations: allAiData.aptitude.recommendations,
            };

            setCurrentPatientData(patientInProgress);

        } catch (err: any) {
            let errorMessage = "Ocurrió un error al procesar el documento. Por favor, inténtalo de nuevo.";
            const errorString = err.message || JSON.stringify(err);

            if (errorString.includes('RESOURCE_EXHAUSTED') || errorString.includes('quota')) {
                errorMessage = "Se ha excedido la cuota de la API. Para continuar, por favor habilita la facturación en tu proyecto de Google Cloud. Consulta la documentación oficial para más detalles.";
            } else if (err.message) {
                errorMessage = err.message;
            }

            console.error("Error al extraer datos:", err);
            setError(errorMessage);
            alert(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const openPreviewWindow = (content: string, title: string) => {
        const newWindow = window.open('', '_blank');
        if (newWindow) {
            newWindow.document.open();
            newWindow.document.write(content);
            newWindow.document.close();
            newWindow.document.title = title;
        } else {
            alert('No se pudo abrir la ventana. Por favor, deshabilita el bloqueador de ventanas emergentes.');
        }
    };

    const getPrintableContent = (patientName: string) => {
        const reportContentElement = document.getElementById('report-content');
        if (!reportContentElement) return null;

        const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
            .map(el => el.outerHTML)
            .join('\n');

        const reportHtml = reportContentElement.innerHTML;
        const printTitle = `Reporte_Medico_${patientName}`;

        return {
            html: `
        <!DOCTYPE html>
        <html lang="es">
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${printTitle}</title>
            ${styles}
            <script src="https://cdn.tailwindcss.com"></script>
          </head>
          <body>
            ${reportHtml}
          </body>
        </html>
      `,
            title: printTitle,
        };
    };

    const handlePreview = () => {
        if (!currentPatientData) {
            alert("No hay datos de paciente para mostrar.");
            return;
        }
        const content = getPrintableContent(currentPatientData.fullName.replace(/\s+/g, '_'));
        if (content) {
            const previewHtml = content.html.replace('<body>', '<body class="bg-gray-200 py-8">');
            openPreviewWindow(previewHtml, content.title);
        }
    };

    const handlePrint = () => {
        if (!currentPatientData) {
            alert("No se puede exportar: faltan datos del reporte.");
            return;
        }
        const content = getPrintableContent(currentPatientData.fullName.replace(/\s+/g, '_'));
        if (content) {
            const printHtml = content.html.replace('<body>', '<body onload="window.print()">') +
                '<script>window.onafterprint = () => window.close();</script>';
            openPreviewWindow(printHtml, content.title);
        }
    };

    return (
        <div className="flex flex-col md:flex-row h-screen font-sans">
            <header className="w-full md:w-96 bg-white p-6 shadow-lg overflow-y-auto no-print">
                <div className="flex items-center gap-4 mb-6">
                    <img src="https://i.postimg.cc/VLWbhvx4/LOGO-WEB-G.png" alt="GP Medical Health Logo" className="h-10" />
                    <h1 className="text-xl font-bold text-gray-800">Panel de Control</h1>
                </div>

                <section className="mb-6">
                    <h2 className="text-md font-semibold text-gray-700 border-b pb-2 mb-3">1. Seleccionar Paciente</h2>
                    <label htmlFor="patient-select" className="sr-only">Seleccionar Paciente</label>
                    <select
                        id="patient-select"
                        value={selectedPatientId ?? ''}
                        onChange={handlePatientSelect}
                        className="block w-full p-2 border border-gray-300 rounded-md bg-white focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="" disabled>-- Seleccione un paciente --</option>
                        {allPatients.map(p => (
                            <option key={p.id} value={p.id} className="text-black">{p.fullName}</option>
                        ))}
                    </select>
                </section>

                <section className="mb-6">
                    <h2 className="text-md font-semibold text-gray-700 border-b pb-2 mb-3">2. Cargar Documentos y Generar</h2>
                    <FileUpload
                        onLabFileChange={setLabPdf}
                        onAudioFileChange={setAudiometryPdf}
                    />
                    <button
                        onClick={handleGenerateReport}
                        disabled={!labPdf || !selectedPatientId || isLoading}
                        className="mt-3 w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition duration-300 flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <><svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Procesando Reporte...</span></>
                        ) : '✨ Generar Reporte con IA'}
                    </button>
                </section>

                <section className="mb-6">
                    <h2 className="text-md font-semibold text-gray-700 border-b pb-2 mb-3">3. Exportar Reporte</h2>
                    <div className="flex flex-col space-y-2">
                        <button
                            onClick={handlePreview}
                            disabled={isLoading || !currentPatientData}
                            className="w-full bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition duration-300 disabled:bg-gray-400"
                        >
                            Vista Previa
                        </button>
                        <button
                            onClick={handlePrint}
                            disabled={isLoading || !currentPatientData}
                            className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition duration-300 disabled:bg-gray-400"
                        >
                            Exportar PDF / Imprimir
                        </button>
                    </div>
                    {error && <p className="mt-4 text-sm text-red-600 bg-red-100 p-3 rounded-lg">{error}</p>}
                </section>
            </header>

            <main className="flex-1 bg-gray-200 p-4 md:p-8 overflow-y-auto">
                <div id="report-content">
                    {currentPatientData ? (
                        <MedicalReport patient={currentPatientData} />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center text-gray-500 p-8 bg-white rounded-lg shadow-md">
                                <h2 className="text-2xl font-bold mb-2">Generador de Reportes Médicos</h2>
                                <p>Por favor, seleccione un paciente y cargue los documentos requeridos para empezar.</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default GeneradorReportes;
