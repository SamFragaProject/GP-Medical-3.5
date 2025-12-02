import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { FileUploader } from '../../components/apps/extractor/FileUploader';
import { PatientTable } from '../../components/apps/extractor/PatientTable';
import { analyzeMedicalDocuments } from '../../services/apps/geminiExtractor';
import { PatientData, AppStatus } from '../../types/extractor';
import { BrainCircuit, Download, Database, Trash, Loader2, Stethoscope, Save } from 'lucide-react';
import { mockDataService } from '@/services/mockDataService';

export default function ExtractorMedico() {
    const [files, setFiles] = useState<File[]>([]);
    const [patients, setPatients] = useState<PatientData[]>([]);
    const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [progress, setProgress] = useState<string>("");

    // Load data from localStorage on mount
    useEffect(() => {
        const savedData = localStorage.getItem('medical_patients_data');
        if (savedData) {
            try {
                setPatients(JSON.parse(savedData));
            } catch (e) {
                console.error("Error loading data", e);
            }
        }
    }, []);

    // Save data to localStorage whenever patients change
    useEffect(() => {
        localStorage.setItem('medical_patients_data', JSON.stringify(patients));
    }, [patients]);

    // Helper to get mime type
    const getMimeType = (filename: string) => {
        const ext = filename.split('.').pop()?.toLowerCase();
        if (ext === 'pdf') return 'application/pdf';
        if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
        if (ext === 'png') return 'image/png';
        return 'application/octet-stream';
    };

    // Function to prepare files: Unzip archives and group by folder
    const preparePatientGroups = async (inputFiles: File[]): Promise<{ id: string; files: File[] }[]> => {
        const groups: { id: string; files: File[] }[] = [];
        const looseFiles: File[] = [];

        for (const file of inputFiles) {
            if (file.name.toLowerCase().endsWith('.zip')) {
                try {
                    const zip = await JSZip.loadAsync(file);
                    const zipGroups = new Map<string, File[]>();

                    // Iterate through zip contents
                    const entries = Object.keys(zip.files).map(name => zip.files[name]);
                    for (const entry of entries) {
                        // Skip folders, MacOS artifacts, and hidden files
                        if (entry.dir || entry.name.includes('__MACOSX') || entry.name.startsWith('.')) continue;

                        // Filter only valid extensions
                        const ext = entry.name.split('.').pop()?.toLowerCase();
                        if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext || '')) continue;

                        // Determine folder name (Patient ID)
                        // Example: "Patient Folder/Lab.pdf" -> parts=["Patient Folder", "Lab.pdf"]
                        const parts = entry.name.split('/');
                        let folderName = "Zip_Root";

                        // Find the first meaningful folder name
                        if (parts.length > 1) {
                            // Use the top-level folder as the patient identifier
                            folderName = parts[0];
                        }

                        const blob = await entry.async('blob');
                        const mimeType = getMimeType(entry.name);
                        // Create a File object from the blob
                        const extractedFile = new File([blob], parts[parts.length - 1], { type: mimeType });

                        if (!zipGroups.has(folderName)) {
                            zipGroups.set(folderName, []);
                        }
                        zipGroups.get(folderName)?.push(extractedFile);
                    }

                    // Add zip groups to main groups
                    zipGroups.forEach((groupFiles, folderName) => {
                        if (groupFiles.length > 0) {
                            groups.push({ id: folderName, files: groupFiles });
                        }
                    });

                } catch (e) {
                    console.error("Error reading zip", e);
                    throw new Error(`No se pudo leer el archivo ZIP: ${file.name}`);
                }
            } else {
                looseFiles.push(file);
            }
        }

        // Add any non-zip files as a single "Manual Upload" group
        if (looseFiles.length > 0) {
            groups.push({ id: 'Carga_Manual', files: looseFiles });
        }

        return groups;
    };

    const handleAnalyze = async () => {
        if (files.length === 0) return;

        setStatus(AppStatus.PROCESSING);
        setErrorMsg(null);
        setProgress("Descomprimiendo y organizando...");

        try {
            // 1. Unzip and Group Files
            const patientGroups = await preparePatientGroups(files);

            if (patientGroups.length === 0) {
                throw new Error("No se encontraron archivos válidos (PDF/Imágenes) dentro del ZIP o la selección.");
            }

            // 2. Process sequentially
            let successCount = 0;
            const total = patientGroups.length;

            for (let i = 0; i < total; i++) {
                const group = patientGroups[i];
                // Clean folder name for display
                const displayName = group.id.replace(/_/g, ' ').replace('Zip Root', 'Expediente General');
                setProgress(`Analizando paciente ${i + 1} de ${total}: ${displayName}...`);

                try {
                    const extractedData = await analyzeMedicalDocuments(group.files);
                    setPatients(prev => [extractedData, ...prev]);
                    successCount++;
                } catch (err) {
                    console.error(`Error processing group ${group.id}`, err);
                    // Continue with next patient even if one fails
                }
            }

            if (successCount === 0) {
                throw new Error("No se pudo extraer información válida de los archivos proporcionados. Verifica que sean legibles.");
            }

            setStatus(AppStatus.SUCCESS);
            setFiles([]); // Clear files after processing
            setProgress("");

        } catch (error: any) {
            setStatus(AppStatus.ERROR);
            setErrorMsg(error.message || "Ocurrió un error al procesar los documentos.");
            setProgress("");
        }
    };

    const handleExportExcel = () => {
        if (patients.length === 0) return;

        // STRICT 1-27 ORDER MAPPING WITH CORRECT ORTHOGRAPHY
        const exportData = patients.map(p => ({
            "Nombre Completo": p.nombreCompleto,
            "Fec. Nacimiento": p.fechaNacimiento,
            "Edad": p.edad,
            "Género": p.genero,
            "Peso (kg)": p.peso,
            "Talla (m)": p.talla,
            "IMC": p.imc,
            "Clasificación IMC": p.clasificacionIMC,
            "% Grasa Visceral": p.porcentajeGrasaVisceral,
            "% Grasa Corporal": p.porcentajeGrasaCorporal,
            "% Músculo": p.porcentajeMusculo,
            "TA (mmHg)": p.ta_mmHg,
            "FC (lpm)": p.fc_lpm,
            "FR (rpm)": p.fr_rpm,
            "SatO2 (%)": p.satO2,
            "Temp (°C)": p.temp_C,
            "Biometría Hemática": p.biometriaHematica,
            "Química Sanguínea (6 Elem)": p.quimicaSanguinea6,
            "Filtración Glomerular": p.tasaFiltracionGlomerular,
            "Creatinina en Orina": p.creatininaOrina,
            "Microalbuminuria en Orina": p.microalbuminuriaOrina,
            "Examen General de Orina": p.examenGeneralOrina,
            "Relación Albúmina/Creatinina": p.relacionAlbuminaCreatinina,
            "Perfil Hepático": p.perfilHepatico,
            "Electrolitos Séricos": p.electrolitosSericos,
            "Audiometría": p.audiometria,
            "Relación Creatinina": p.relacionCreatinina
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Pacientes");

        // Generate date string for filename
        const date = new Date().toISOString().split('T')[0];
        XLSX.writeFile(wb, `Base_Datos_Medica_${date}.xlsx`);
    };

    const handleDeletePatient = (id: string) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este registro?")) {
            setPatients(prev => prev.filter(p => p.id !== id));
        }
    };

    const handleClearAll = () => {
        if (window.confirm("¿Estás seguro de que deseas borrar TODOS los registros? Esta acción no se puede deshacer.")) {
            setPatients([]);
            localStorage.removeItem('medical_patients_data');
        }
    };

    const handleSaveToSystem = async () => {
        if (patients.length === 0) return;
        if (!window.confirm(`¿Deseas guardar ${patients.length} pacientes en el sistema ERP?`)) return;

        setStatus(AppStatus.PROCESSING);
        setProgress("Guardando en el sistema...");

        let savedCount = 0;
        for (const p of patients) {
            try {
                // Split name logic (simplified)
                const parts = (p.nombreCompleto || '').trim().split(/\s+/);
                let nombre = '';
                let apellido_paterno = '';
                let apellido_materno = '';

                if (parts.length > 0) nombre = parts[0];
                if (parts.length > 1) apellido_paterno = parts[1];
                if (parts.length > 2) apellido_materno = parts.slice(2).join(' ');

                // Convert Date DD/MM/YYYY to YYYY-MM-DD
                let dob = '';
                if (p.fechaNacimiento) {
                    const [d, m, y] = p.fechaNacimiento.split('/');
                    if (d && m && y) dob = `${y}-${m}-${d}`;
                }

                await mockDataService.createPaciente({
                    numero_empleado: `EXT-${Math.floor(Math.random() * 10000)}`,
                    nombre,
                    apellido_paterno,
                    apellido_materno,
                    genero: p.genero?.toLowerCase() || 'otro',
                    fecha_nacimiento: dob,
                    estatus: 'activo',
                    empresa_id: 'demo',
                    puesto_trabajo: { nombre: 'Importado', departamento: 'General' }
                });
                savedCount++;
            } catch (e) {
                console.error("Error saving patient", e);
            }
        }

        setStatus(AppStatus.SUCCESS);
        setProgress("");
        alert(`Se guardaron ${savedCount} pacientes correctamente en la base de datos del ERP.`);
        setTimeout(() => setStatus(AppStatus.IDLE), 2000);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-brand-600 p-2 rounded-lg shadow-brand">
                            <Stethoscope className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">Extractor Médico AI</h1>
                            <p className="text-xs text-slate-500 mt-0.5">Extracción Masiva Inteligente</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                        <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
                            <Database className="w-4 h-4 text-slate-400" />
                            <span className="font-semibold text-slate-700">{patients.length}</span>
                            <span className="text-slate-500">registros</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Top Section: Upload & Actions */}
                <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Upload Card */}
                    <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                                <BrainCircuit className="w-5 h-5 text-brand-600" />
                                1. Cargar Expedientes (ZIP o Archivos)
                            </h2>
                            {status === AppStatus.PROCESSING && (
                                <span className="text-brand-600 text-xs font-bold uppercase tracking-wide animate-pulse">
                                    {progress}
                                </span>
                            )}
                        </div>

                        {/* Vista Previa de Datos Section - Fixed Height & Padding in FileUploader */}
                        <FileUploader
                            files={files}
                            setFiles={setFiles}
                            disabled={status === AppStatus.PROCESSING}
                        />

                        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-slate-400 text-xs hidden sm:block">
                                Recomendado: Sube un <strong>ZIP</strong> con carpetas separadas por paciente.
                            </p>
                            <div className="w-full sm:w-auto">
                                {status === AppStatus.PROCESSING ? (
                                    <button disabled className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-brand-50 text-brand-700 border border-brand-200 rounded-xl font-medium cursor-wait">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Procesando...
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleAnalyze}
                                        disabled={files.length === 0}
                                        className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-medium shadow-sm transition-all transform active:scale-95
                                    ${files.length === 0
                                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                                : 'bg-brand-600 text-white hover:bg-brand-700 hover:shadow-md border border-transparent'}
                                `}
                                    >
                                        <BrainCircuit className="w-5 h-5" />
                                        Iniciar Análisis Masivo
                                    </button>
                                )}
                            </div>
                        </div>

                        {errorMsg && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-start gap-2">
                                <span className="text-lg">⚠️</span>
                                <div>
                                    <strong>Error:</strong> {errorMsg}
                                </div>
                            </div>
                        )}
                        {status === AppStatus.SUCCESS && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-5 h-5 bg-green-200 rounded-full flex items-center justify-center text-green-700 text-xs">✓</div>
                                    <span>Análisis masivo completado. Verifica la tabla abajo.</span>
                                </div>
                                <button onClick={() => setStatus(AppStatus.IDLE)} className="text-green-700 font-bold text-xs hover:underline uppercase tracking-wide">Cerrar</button>
                            </div>
                        )}
                    </div>

                    {/* Stats / Export Card */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-1 flex flex-col justify-center items-center text-center">
                            <div className="w-16 h-16 bg-brand-50 rounded-full flex items-center justify-center mb-4">
                                <Database className="w-8 h-8 text-brand-600" />
                            </div>
                            <h3 className="text-slate-800 font-semibold text-lg">Base de Datos Local</h3>
                            <p className="text-slate-500 text-sm mt-1 mb-6 max-w-[250px]">
                                Pacientes procesados listos para exportar.
                            </p>
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-4xl font-bold text-slate-900">{patients.length}</span>
                                <span className="text-slate-500 font-medium">pacientes</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                                <Download className="w-5 h-5 text-brand-600" />
                                2. Exportar
                            </h2>
                            <div className="space-y-3">
                                <button
                                    onClick={handleExportExcel}
                                    disabled={patients.length === 0}
                                    className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm border transition-colors
                                ${patients.length === 0
                                            ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                                            : 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700 shadow-md hover:shadow-lg'}
                            `}
                                >
                                    <Download className="w-5 h-5" />
                                    Descargar Excel Completo
                                </button>

                                <button
                                    onClick={handleSaveToSystem}
                                    disabled={patients.length === 0}
                                    className={`w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-xl font-bold text-sm border transition-colors
                                ${patients.length === 0
                                            ? 'bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed'
                                            : 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'}
                            `}
                                >
                                    <Save className="w-5 h-5" />
                                    Guardar en ERP
                                </button>

                                {patients.length > 0 && (
                                    <button
                                        onClick={handleClearAll}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-red-500 hover:bg-red-50 hover:text-red-700 transition-colors text-xs"
                                    >
                                        <Trash className="w-3 h-3" />
                                        Limpiar Base de Datos
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Bottom Section: Data Table - Vista Previa de Datos header container to match style */}
                <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800">Vista Previa de Resultados</h3>
                            <p className="text-sm text-slate-500">Revisa la información extraída antes de generar el Excel.</p>
                        </div>
                    </div>

                    {patients.length > 0 ? (
                        <PatientTable data={patients} onDelete={handleDeletePatient} />
                    ) : (
                        <div className="bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center">
                            <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
                                <Database className="w-8 h-8 text-slate-300" />
                            </div>
                            <h4 className="text-slate-600 font-medium text-lg">Tabla Vacía</h4>
                            <p className="text-slate-400 text-sm mt-1 max-w-md">
                                Sube un archivo ZIP con carpetas de pacientes para ver la magia.
                            </p>
                        </div>
                    )}
                </section>

            </main>
        </div>
    );
}
