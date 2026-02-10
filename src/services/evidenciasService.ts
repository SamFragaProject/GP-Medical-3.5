// =====================================================
// SERVICIO: Evidencias STPS y Documentos de Seguridad
// Respaldo legal por trabajador
// =====================================================

import { supabase } from '@/lib/supabase';

export interface EvidenciaSTPS {
    id: string;
    paciente_id: string;
    empresa_id: string;
    categoria: 'nom011' | 'nom035' | 'nom036' | 'st7_st9' | 'dictamen' | 'consentimiento' | 'otro';
    nombre_archivo: string;
    url_archivo: string;
    fecha_carga: string;
    valido_hasta?: string;
    validado: boolean;
    validado_por?: string;
    metadata?: any;
    created_at: string;
}

export const evidenciasService = {

    async subirEvidencia(
        paciente_id: string,
        empresa_id: string,
        categoria: EvidenciaSTPS['categoria'],
        archivo: File
    ): Promise<EvidenciaSTPS | null> {
        const fileExt = archivo.name.split('.').pop();
        const fileName = `${paciente_id}/${categoria}_${Date.now()}.${fileExt}`;
        const filePath = `evidencias_stps/${fileName}`;

        // 1. Subir a Storage
        const { error: uploadError } = await supabase.storage
            .from('clinical_docs')
            .upload(filePath, archivo);

        if (uploadError) {
            console.error('Error subiendo archivo STPS:', uploadError);
            return null;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('clinical_docs')
            .getPublicUrl(filePath);

        // 2. Registrar en base de datos
        const { data, error } = await supabase
            .from('evidencias_stps')
            .insert({
                paciente_id,
                empresa_id,
                categoria,
                nombre_archivo: archivo.name,
                url_archivo: publicUrl,
                fecha_carga: new Date().toISOString(),
                validado: false
            })
            .select()
            .single();

        if (error) {
            console.error('Error registrando evidencia STPS:', error);
            return null;
        }

        return data as EvidenciaSTPS;
    },

    async listarPorPaciente(paciente_id: string): Promise<EvidenciaSTPS[]> {
        const { data } = await supabase
            .from('evidencias_stps')
            .select('*')
            .eq('paciente_id', paciente_id)
            .order('created_at', { ascending: false });
        return (data || []) as EvidenciaSTPS[];
    },

    async listarPorEmpresa(empresa_id: string, categoria?: string): Promise<EvidenciaSTPS[]> {
        let query = supabase
            .from('evidencias_stps')
            .select('*, paciente:pacientes(nombre, apellido_paterno)')
            .eq('empresa_id', empresa_id);

        if (categoria) query = query.eq('categoria', categoria);

        const { data } = await query.order('created_at', { ascending: false });
        return (data || []) as EvidenciaSTPS[];
    },

    async validarEvidencia(id: string, valido: boolean, expira?: string): Promise<boolean> {
        const { data: { user } } = await supabase.auth.getUser();
        const { error } = await supabase
            .from('evidencias_stps')
            .update({
                validado: valido,
                validado_por: user?.id,
                valido_hasta: expira
            })
            .eq('id', id);
        return !error;
    }
};

export default evidenciasService;
