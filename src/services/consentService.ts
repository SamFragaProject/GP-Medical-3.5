import { supabase } from '@/lib/supabase'

export interface Consentimiento {
    id?: string;
    empresa_id: string;
    paciente_id: string;
    procedimiento: string;
    descripcion_procedimiento?: string;
    riesgos?: string;
    beneficios?: string;
    alternativas?: string;
    fecha_consentimiento?: string;
    paciente_firmado: boolean;
    paciente_fecha_firma?: string;
    testigo_nombre?: string;
    testigo_documento?: string;
    testigo_firmado?: boolean;
    testigo_fecha_firma?: string;
    doctor_id?: string;
    doctor_firmado?: boolean;
    doctor_fecha_firma?: string;
    documento_url?: string;
    activo?: boolean;
}

export const consentService = {
    async createConsent(consent: Consentimiento) {
        const { data, error } = await supabase
            .from('consentimientos')
            .insert(consent)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async uploadSignature(pacienteId: string, signatureBlob: Blob) {
        const fileName = `${pacienteId}/${Date.now()}_firma.png`
        const { data, error } = await supabase.storage
            .from('consents')
            .upload(fileName, signatureBlob, {
                contentType: 'image/png',
                cacheControl: '3600'
            })

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
            .from('consents')
            .getPublicUrl(data.path)

        return publicUrl
    },

    async getPatientConsents(pacienteId: string) {
        const { data, error } = await supabase
            .from('consentimientos')
            .select('*')
            .eq('paciente_id', pacienteId)
            .eq('activo', true)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as Consentimiento[]
    }
}
