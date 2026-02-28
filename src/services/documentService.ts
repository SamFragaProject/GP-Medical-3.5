import { supabase } from '@/lib/supabase'

export interface DocumentoExpedienteAbierto {
    id: string;
    paciente_id: string;
    empresa_id?: string;
    tipo_documento: string;
    fecha_documento: string;
    datos_extraidos?: any;
    archivo_url?: string;
    archivo_path?: string;
    medico_id?: string;
    observaciones?: string;
    created_at: string;
    updated_at: string;
}

export interface SaveDocumentoParams {
    pacienteId: string;
    empresaId?: string | null;
    tipoDocumento: string;
    datosExtraidos?: any;
    files?: File[];
    pacienteNombre?: string; // For auto-rename
}

/**
 * Builds a safe storage path using the patient name and section type.
 * Format: {pacienteId}/{apellido}_{nombre}_{tipo}_{YYYY-MM-DD}_{HHmmss}.{ext}
 */
function buildStoragePath(pacienteId: string, file: File, tipo: string, pacienteNombre?: string): string {
    const now = new Date();
    const fecha = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const hora = now.toTimeString().split(' ')[0].replace(/:/g, ''); // HHmmss
    const ext = file.name.split('.').pop() || 'bin';
    const cleanTipo = tipo.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

    let prefix = pacienteId;
    if (pacienteNombre) {
        const cleanNombre = pacienteNombre.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toLowerCase();
        prefix = `${pacienteId}/${cleanNombre}`;
    }

    return `${prefix}/${cleanTipo}_${fecha}_${hora}.${ext}`;
}

/**
 * Saves a single document record. Uploads the first file (if provided) and inserts the JSONB data.
 */
export const saveDocumentoExpediente = async (params: SaveDocumentoParams) => {
    let archivo_url = null;
    let archivo_path = null;

    // 1. Upload the first file (if provided) to storage
    if (params.files && params.files.length > 0) {
        const file = params.files[0];
        archivo_path = buildStoragePath(params.pacienteId, file, params.tipoDocumento, params.pacienteNombre);

        const { error: uploadError } = await supabase.storage
            .from('documentos-medicos')
            .upload(archivo_path, file);

        if (!uploadError) {
            const { data } = supabase.storage.from('documentos-medicos').getPublicUrl(archivo_path);
            archivo_url = data.publicUrl;
        } else {
            console.error('Error uploading file:', uploadError);
        }
    }

    // 2. Get current user (doctor)
    const { data: userData } = await supabase.auth.getUser();

    // 3. Insert record with open JSONB data
    const { data, error } = await supabase
        .from('documentos_expediente')
        .insert({
            paciente_id: params.pacienteId,
            empresa_id: params.empresaId,
            tipo_documento: params.tipoDocumento,
            datos_extraidos: params.datosExtraidos,
            archivo_url,
            archivo_path,
            medico_id: userData?.user?.id || null
        })
        .select()
        .single();

    if (error) {
        console.error('Error saving document to DB:', error);
        throw error;
    }

    return data;
};

/**
 * Saves multiple files each as a separate document record. Used by the Smart Onboarding Hub
 * to persist per-section uploads.
 */
export const saveMultipleDocuments = async (params: {
    pacienteId: string;
    empresaId?: string | null;
    pacienteNombre?: string;
    sectionFiles: Record<string, File[]>;
    report: any;
    formData: any;
}) => {
    const { pacienteId, empresaId, pacienteNombre, sectionFiles, report, formData } = params;
    const results = [];

    // Save each section's files and extracted data as separate documents
    for (const [sectionId, files] of Object.entries(sectionFiles)) {
        const sectionData = report?.sections?.[sectionId] || null;

        for (const file of files) {
            const result = await saveDocumentoExpediente({
                pacienteId,
                empresaId,
                tipoDocumento: sectionId,
                datosExtraidos: sectionData ? {
                    results: sectionData.results,
                    summary: sectionData.summary,
                    sectionName: sectionData.name
                } : null,
                files: [file],
                pacienteNombre
            });
            results.push(result);
        }
    }

    // Also save the full clinical history form as a consolidated document
    if (formData) {
        const formResult = await saveDocumentoExpediente({
            pacienteId,
            empresaId,
            tipoDocumento: 'Historia Clínica Onboarding',
            datosExtraidos: {
                formData,
                report: report ? {
                    patientData: report.patientData,
                    vitalSigns: report.vitalSigns,
                    sectionsSummary: Object.fromEntries(
                        Object.entries(report.sections || {}).map(([k, v]: [string, any]) => [k, v.summary])
                    )
                } : null
            },
            pacienteNombre
        });
        results.push(formResult);
    }

    return results;
};

export const getTimelineByPaciente = async (pacienteId: string): Promise<DocumentoExpedienteAbierto[]> => {
    const { data, error } = await supabase
        .from('documentos_expediente')
        .select('*')
        .eq('paciente_id', pacienteId)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching timeline documents:', error);
        throw error;
    }

    return data as DocumentoExpedienteAbierto[];
};
