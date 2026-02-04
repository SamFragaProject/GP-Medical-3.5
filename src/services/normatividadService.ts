import { supabase } from '@/lib/supabase'

export interface CampanaNom035 {
    id: string
    empresa_id: string
    nombre: string
    fecha_inicio: string
    fecha_fin: string
    estado: 'activa' | 'cerrada' | 'borrador'
    tipo_encuesta: string
    created_at: string
}

export interface RespuestaNom035 {
    id: string
    campana_id: string
    empleado_id?: string // Puede ser nulo si es anónima (aunque NOM requiere identificación para seguimiento en casos graves)
    respuestas: Record<string, any>
    resultado_calculado: string
    fecha_respuesta: string
}

export const normatividadService = {
    // === GESTIÓN DE CAMPAÑAS ===

    async getCampanas(empresaId: string) {
        const { data, error } = await supabase
            .from('nom035_campanas')
            .select('*')
            .eq('empresa_id', empresaId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as CampanaNom035[]
    },

    async createCampana(campana: Omit<CampanaNom035, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('nom035_campanas')
            .insert(campana)
            .select()
            .single()

        if (error) throw error
        return data as CampanaNom035
    },

    // === GESTIÓN DE RESPUESTAS ===

    async saveRespuesta(respuesta: Omit<RespuestaNom035, 'id' | 'fecha_respuesta'>) {
        const { data, error } = await supabase
            .from('nom035_respuestas')
            .insert({
                ...respuesta,
                fecha_respuesta: new Date().toISOString()
            })
            .select()
            .single()

        if (error) throw error
        return data as RespuestaNom035
    },

    async getEstadisticasCampana(campanaId: string) {
        // En una implementación real usaríamos RPCs de Supabase para agregación
        const { data, error } = await supabase
            .from('nom035_respuestas')
            .select('resultado_calculado')
            .eq('campana_id', campanaId)

        if (error) throw error

        // Procesamiento simple en cliente (para MVP)
        const stats = {
            total: data.length,
            riesgo_nulo: data.filter(r => r.resultado_calculado === 'nulo').length,
            riesgo_bajo: data.filter(r => r.resultado_calculado === 'bajo').length,
            riesgo_medio: data.filter(r => r.resultado_calculado === 'medio').length,
            riesgo_alto: data.filter(r => r.resultado_calculado === 'alto').length,
            riesgo_muy_alto: data.filter(r => r.resultado_calculado === 'muy_alto').length,
            requiere_valoracion: data.filter(r => r.resultado_calculado === 'requiere_valoracion').length // Para ATS
        }
        return stats
    }
}
