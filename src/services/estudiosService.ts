import { supabase } from '@/lib/supabase'

export interface EstudioCatalogo {
    id: string
    nombre: string
    categoria: 'laboratorio' | 'rayos_x' | 'audiometria' | 'espirometria' | 'cardiologia' | 'tomografia' | 'otro'
    codigo_interno?: string
    precio_publico?: number
    instrucciones_paciente?: string
}

export interface OrdenEstudio {
    id: string
    paciente_id: string
    medico_id: string
    fecha_solicitud: string
    prioridad: 'normal' | 'urgente'
    estado: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada'
    diagnostico_presuntivo?: string
    paciente?: { nombre: string, apellido_paterno: string, nss?: string } // Join
    detalles?: DetalleOrden[]
}

export interface DetalleOrden {
    id: string
    estudio_id: string
    estado: string
    estudio?: EstudioCatalogo
    resultado?: ResultadoEstudio
}

export interface ResultadoEstudio {
    id: string
    archivo_url?: string
    interpretacion_texto?: string
    conclusiones?: string
    fecha_resultado: string
}

export const estudiosService = {
    // === CATALOGO ===
    async getCatalogo(empresaId: string) {
        // Trae globales (empresa_id null) y propios
        const { data, error } = await supabase
            .from('catalogo_estudios')
            .select('*')
            .or(`empresa_id.eq.${empresaId},empresa_id.is.null`)
            .order('nombre')

        if (error) throw error
        return data as EstudioCatalogo[]
    },

    // === ORDENES ===
    async getOrdenes(empresaId: string) {
        const { data, error } = await supabase
            .from('ordenes_estudios')
            .select(`
                *,
                paciente:pacientes(nombre, apellido_paterno, nss),
                detalles:detalles_orden_estudios(
                    *,
                    estudio:catalogo_estudios(*),
                    resultado:resultados_estudios(*)
                )
            `)
            .eq('empresa_id', empresaId)
            .order('fecha_solicitud', { ascending: false })

        if (error) throw error
        return data as OrdenEstudio[]
    },

    async crearOrden(orden: Partial<OrdenEstudio>, estudiosIds: string[]) {
        // 1. Crear Cabecera
        const { data: ordenData, error: ordenError } = await supabase
            .from('ordenes_estudios')
            .insert(orden)
            .select()
            .single()

        if (ordenError) throw ordenError

        // 2. Crear Detalles
        const detalles = estudiosIds.map(estudioId => ({
            orden_id: ordenData.id,
            estudio_id: estudioId,
            estado: 'pendiente'
        }))

        const { error: detallesError } = await supabase
            .from('detalles_orden_estudios')
            .insert(detalles)

        if (detallesError) throw detallesError

        return ordenData
    }
}
