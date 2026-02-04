import { supabase } from '@/lib/supabase'

export interface PuestoTrabajo {
    id: string
    nombre: string
    descripcion?: string
    departamento?: string
    riesgos_asociados?: MatrizRiesgoItem[]
    protocolos?: ProtocoloPuesto[]
}

export interface RiesgoCatalogo {
    id: string
    nombre: string
    categoria: string
    organo_blanco?: string
}

export interface MatrizRiesgoItem {
    id: string
    puesto_id: string
    riesgo_id: string
    nivel_exposicion: 'bajo' | 'medio' | 'alto'
    frecuencia: 'ocasional' | 'frecuente' | 'constante'
    riesgo?: RiesgoCatalogo // Join
}

export interface ProtocoloPuesto {
    id: string
    puesto_id: string
    tipo_examen: 'ingreso' | 'periodico' | 'especial' | 'salida'
    estudios_requeridos: string[] // IDs de estudios
    frecuencia_meses?: number
}

export const matrizRiesgosService = {
    // === PUESTOS ===
    async getPuestos(empresaId: string) {
        const { data, error } = await supabase
            .from('puestos_trabajo')
            .select(`
                *,
                riesgos_asociados:matriz_riesgos_puesto(
                    *,
                    riesgo:catalogo_riesgos(*)
                ),
                protocolos:protocolos_puesto(*)
            `)
            .eq('empresa_id', empresaId)
            .order('nombre')

        if (error) throw error
        return data as PuestoTrabajo[]
    },

    async createPuesto(puesto: Partial<PuestoTrabajo>) {
        const { data, error } = await supabase
            .from('puestos_trabajo')
            .insert(puesto)
            .select()
            .single()

        if (error) throw error
        return data as PuestoTrabajo
    },

    // === RIESGOS ===
    async getCatalogoRiesgos() {
        const { data, error } = await supabase
            .from('catalogo_riesgos')
            .select('*')
            .order('categoria')

        if (error) throw error
        return data as RiesgoCatalogo[]
    },

    async vincularRiesgo(item: Partial<MatrizRiesgoItem>) {
        const { data, error } = await supabase
            .from('matriz_riesgos_puesto')
            .insert(item)
            .select()
            .single()

        if (error) throw error
        return data
    },

    async desvincularRiesgo(id: string) {
        const { error } = await supabase
            .from('matriz_riesgos_puesto')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}
