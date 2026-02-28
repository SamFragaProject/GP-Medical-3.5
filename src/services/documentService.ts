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
}

export const saveDocumentoExpediente = async (params: SaveDocumentoParams) => {
    let archivo_url = null;
    let archivo_path = null;

    // 1. Upload the first file (if provided) to storage
    if (params.files && params.files.length > 0) {
        const file = params.files[0];
        const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        archivo_path = `${params.pacienteId}/${Date.now()}_${cleanName}`;

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
