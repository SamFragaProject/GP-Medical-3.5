import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import JSZip from 'jszip';
import { FileUploader } from '../../components/apps/extractor/FileUploader';
import { PatientTable } from '../../components/apps/extractor/PatientTable';
import { analyzeMedicalDocuments } from '../../services/apps/geminiExtractor';
import { PatientData, AppStatus } from '../../types/extractor';
import { BrainCircuit, Download, Database, Trash, Loader2, Stethoscope, Save, FileText, Upload, CheckCircle, AlertTriangle } from 'lucide-react';
import { pacientesService } from '@/services/dataService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

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

                await pacientesService.create({
                    numero_empleado: `EXT-${Math.floor(Math.random() * 10000)}`,
                    nombre,
                    apellido_paterno,
                    apellido_materno,
                    genero: p.genero?.toLowerCase() || 'otro',
                    fecha_nacimiento: dob,
                    estatus: 'activo',
                    empresa_id: 'empresa-demo-1', // ID temporal mientras se integra Auth
                    puesto: 'Importado',
                    departamento: 'General'
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
        <div className="min-h-screen bg-slate-50/50 text-slate-900 font-sans pb-20">
            {/* Premium Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-600/5 to-cyan-500/5"></div>
                <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-gradient-to-br from-brand-600 to-brand-700 p-2.5 rounded-xl shadow-lg shadow-brand-500/20"
                        >
                            <BrainCircuit className="w-6 h-6 text-white" />
                        </motion.div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-brand-800 to-brand-600">
                                Extractor Médico AI
                            </h1>
                            <p className="text-xs font-medium text-slate-500 mt-1">
                                Procesamiento Inteligente de Expedientes
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge variant="outline" className="hidden md:flex gap-2 py-1.5 px-4 bg-white/50 backdrop-blur border-slate-200">
                            <Database className="w-4 h-4 text-brand-500" />
                            <span className="font-bold text-slate-700">{patients.length}</span>
                            <span className="text-slate-500 font-normal">registros</span>
                        </Badge>
                    </div>
                </div>
            </div>

            <main className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Top Section: Upload & Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Upload Card */}
                    <Card className="lg:col-span-8 border-slate-200 shadow-sm bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100/50 pb-4">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-3 text-lg">
                                    <div className="p-2 bg-brand-100 rounded-lg">
                                        <Upload className="w-4 h-4 text-brand-600" />
                                    </div>
                                    Cargar Expedientes (ZIP)
                                </CardTitle>
                                {status === AppStatus.PROCESSING && (
                                    <Badge variant="secondary" className="bg-brand-50 text-brand-700 animate-pulse border-brand-100">
                                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                        {progress}
                                    </Badge>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            <FileUploader
                                files={files}
                                setFiles={setFiles}
                                disabled={status === AppStatus.PROCESSING}
                            />

                            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex gap-2 items-start max-w-lg">
                                    <div className="mt-1 min-w-[5px] h-[5px] rounded-full bg-brand-400"></div>
                                    <p className="text-slate-500 text-xs leading-relaxed">
                                        Para mejores resultados, sube un archivo <strong>.ZIP</strong> con carpetas nombradas por paciente. El sistema organizará automáticamente las imágenes y PDFs.
                                    </p>
                                </div>
                                <div className="w-full sm:w-auto">
                                    <Button
                                        onClick={handleAnalyze}
                                        disabled={files.length === 0 || status === AppStatus.PROCESSING}
                                        className={`w-full sm:min-w-[200px] h-11 text-base shadow-lg shadow-brand-500/20 ${status === AppStatus.PROCESSING ? 'bg-brand-100 text-brand-700' : 'bg-brand-600 hover:bg-brand-700'
                                            }`}
                                    >
                                        {status === AppStatus.PROCESSING ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Procesando...
                                            </>
                                        ) : (
                                            <>
                                                <BrainCircuit className="w-5 h-5 mr-2" />
                                                Iniciar Análisis
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {status === AppStatus.ERROR && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-start gap-3"
                                >
                                    <div className="bg-red-100 p-1 rounded-full"><AlertTriangle className="w-4 h-4 text-red-600" /></div>
                                    <div>
                                        <strong className="block font-semibold mb-1">Error en el proceso</strong>
                                        {errorMsg}
                                    </div>
                                </motion.div>
                            )}

                            {status === AppStatus.SUCCESS && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-4 p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800 text-sm flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                                            <CheckCircle className="w-4 h-4 text-emerald-600" />
                                        </div>
                                        <span className="font-medium">¡Análisis completado con éxito! Revisa la tabla inferior.</span>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => setStatus(AppStatus.IDLE)} className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-100">
                                        Cerrar
                                    </Button>
                                </motion.div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Stats / Export Card */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <Card className="flex-1 border-slate-200 shadow-sm text-center">
                            <CardContent className="pt-8 pb-8 flex flex-col items-center justify-center h-full">
                                <div className="w-20 h-20 bg-gradient-to-br from-brand-50 to-brand-100 rounded-3xl flex items-center justify-center mb-6 shadow-inner border border-brand-50">
                                    <Database className="w-10 h-10 text-brand-600" />
                                </div>
                                <h3 className="text-slate-900 font-bold text-xl mb-1">Resultados Listos</h3>
                                <p className="text-slate-500 text-sm mb-8 max-w-[200px] mx-auto">
                                    Pacientes procesados y listos para exportar
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-bold text-slate-900 tracking-tight">{patients.length}</span>
                                    <span className="text-slate-500 font-medium">expedientes</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-slate-200 shadow-sm">
                            <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                    <Download className="w-4 h-4 text-slate-500" />
                                    Acciones de Exportación
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Button
                                    onClick={handleExportExcel}
                                    disabled={patients.length === 0}
                                    variant="outline"
                                    className="w-full h-12 justify-start border-slate-200 hover:bg-slate-50 hover:text-slate-900 font-semibold"
                                >
                                    <div className="p-1 bg-emerald-100 rounded mr-3">
                                        <FileText className="w-4 h-4 text-emerald-600" />
                                    </div>
                                    Descargar Excel
                                </Button>

                                <Button
                                    onClick={handleSaveToSystem}
                                    disabled={patients.length === 0}
                                    className="w-full h-12 justify-start bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-md shadow-brand-500/10"
                                >
                                    <div className="p-1 bg-brand-500 rounded mr-3">
                                        <Save className="w-4 h-4 text-white" />
                                    </div>
                                    Guardar en ERP
                                </Button>

                                {patients.length > 0 && (
                                    <Button
                                        onClick={handleClearAll}
                                        variant="ghost"
                                        className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 h-9 text-xs"
                                    >
                                        <Trash className="w-3 h-3 mr-2" />
                                        Limpiar Todo
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Bottom Section: Data Table */}
                <Card className="border-slate-200 shadow-sm overflow-hidden">
                    <CardHeader className="border-b border-slate-100 bg-slate-50/50">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle>Vista Previa de Resultados</CardTitle>
                                <CardDescription>Revisa la información extraída antes de guardar</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {patients.length > 0 ? (
                            <div className="p-4">
                                <PatientTable data={patients} onDelete={handleDeletePatient} />
                            </div>
                        ) : (
                            <div className="p-16 flex flex-col items-center justify-center text-center">
                                <div className="bg-slate-50 p-4 rounded-full mb-4 shadow-sm border border-slate-100">
                                    <Database className="w-8 h-8 text-slate-300" />
                                </div>
                                <h4 className="text-slate-600 font-medium text-lg">Tabla Vacía</h4>
                                <p className="text-slate-400 text-sm mt-1 max-w-sm">
                                    Sube tus archivos para visualizar los datos extraídos aquí.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>

            </main>
        </div>
    );
}


