import { supabase } from '@/lib/supabase'

export interface Comunicado {
    id: string
    titulo: string
    mensaje: string
    tipo: 'info' | 'success' | 'warning' | 'update' | 'release'
    archivo_url?: string
    archivo_nombre?: string
    empresa_id?: string | null
    autor_id: string
    is_active: boolean
    created_at: string
    expires_at?: string
}

export const comunicadosService = {
    // Obtener comunicados activos (para el feed)
    async getActiveFeed(): Promise<Comunicado[]> {
        const { data, error } = await supabase
            .from('comunicados_erp')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .limit(10)

        if (error) {
            console.error('Error fetching comunicados:', error)
            return []
        }
        return data as Comunicado[]
    },

    // Obtener todos los comunicados (para Super Admin manager)
    async getAll(): Promise<Comunicado[]> {
        const { data, error } = await supabase
            .from('comunicados_erp')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching todos los comunicados:', error)
            return []
        }
        return data as Comunicado[]
    },

    // Crear un comunicado
    async create(comunicado: Partial<Comunicado>, file?: File): Promise<Comunicado | null> {
        let archivo_url = comunicado.archivo_url
        let archivo_nombre = comunicado.archivo_nombre

        // Si hay archivo, lo subimos
        if (file) {
            const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('comunicados')
                .upload(fileName, file)

            if (!uploadError) {
                const { data: { publicUrl } } = supabase.storage
                    .from('comunicados')
                    .getPublicUrl(fileName)
                archivo_url = publicUrl
                archivo_nombre = file.name
            } else {
                console.error('Error uploading file:', uploadError)
                throw uploadError
            }
        }

        const { data, error } = await supabase
            .from('comunicados_erp')
            .insert([{
                ...comunicado,
                archivo_url,
                archivo_nombre,
            }])
            .select()
            .single()

        if (error) throw error
        return data as Comunicado
    },

    // Actualizar un comunicado
    async update(id: string, updates: Partial<Comunicado>): Promise<void> {
        const { error } = await supabase
            .from('comunicados_erp')
            .update(updates)
            .eq('id', id)

        if (error) throw error
    },

    // Eliminar un comunicado
    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('comunicados_erp')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}
