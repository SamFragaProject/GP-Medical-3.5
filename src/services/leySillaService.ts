import { supabase } from '@/lib/supabase'

export interface AreaLeySilla {
    id: string
    empresa_id: string
    nombre_area: string
    ubicacion_fisica?: string
    total_trabajadores: number
    trabajadores_de_pie: number
    asientos_disponibles: number
    cumple_ratio: boolean
    tipo_asiento: string
    estado_mobiliario: string
    foto_evidencia_url?: string
    protocolo_descanso?: string
    updated_at: string
}

export const leySillaService = {
    async getAll(empresaId: string) {
        const { data, error } = await supabase
            .from('ley_silla_areas')
            .select('*')
            .eq('empresa_id', empresaId)
            .order('nombre_area')

        if (error) throw error
        return data as AreaLeySilla[]
    },

    async create(area: Omit<AreaLeySilla, 'id' | 'updated_at' | 'cumple_ratio'>) {
        // Calcular cumplimiento automático
        // La ley sugiere asientos suficientes para el descanso periódico. 
        // Si hay rotación, no se necesita 1:1, pero asumimos lógica simple:
        // Si hay al menos 1 silla por cada X trabajadores o si el área de descanso es cercana.
        // Para este MVP: Cumple si asientos > 0 o trabajadores_de_pie == 0
        const cumple = area.asientos_disponibles > 0 || area.trabajadores_de_pie === 0

        const { data, error } = await supabase
            .from('ley_silla_areas')
            .insert({ ...area, cumple_ratio: cumple })
            .select()
            .single()

        if (error) throw error
        return data as AreaLeySilla
    },

    async update(id: string, updates: Partial<AreaLeySilla>) {
        const { data, error } = await supabase
            .from('ley_silla_areas')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as AreaLeySilla
    },

    // Simular upload de foto de evidencia
    async uploadEvidencia(file: File, empresaId: string) {
        // En prod: Subir a bucket 'evidencias-normativas'
        // Retornar URL simulada
        return `https://fake-storage.com/${empresaId}/${file.name}`
    }
}
