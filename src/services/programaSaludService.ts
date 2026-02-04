import { supabase } from '@/lib/supabase'

export interface ProgramaAnual {
    id: string
    empresa_id: string
    anio: number
    nombre: string
    estado: 'borrador' | 'activo' | 'cerrado'
    avance_general: number
    actividades?: ActividadPrograma[]
}

export interface ActividadPrograma {
    id: string
    programa_id: string
    nombre: string
    tipo: 'examen_medico' | 'campana_salud' | 'capacitacion' | 'simulacro' | 'auditoria'
    fecha_inicio: string
    fecha_fin: string
    poblacion_objetivo: string
    meta_pacientes?: number
    estado: 'programada' | 'en_curso' | 'realizada' | 'cancelada'
    costo_estimado?: number
    riesgo_asociado_id?: string
}

export const programaSaludService = {
    async getProgramaActual(empresaId: string, anio: number) {
        const { data, error } = await supabase
            .from('programas_anuales')
            .select(`
                *,
                actividades:actividades_programa(*)
            `)
            .eq('empresa_id', empresaId)
            .eq('anio', anio)
            .single()

        if (error && error.code !== 'PGRST116') throw error
        return data as ProgramaAnual | null
    },

    async createPrograma(programa: Partial<ProgramaAnual>) {
        const { data, error } = await supabase
            .from('programas_anuales')
            .insert(programa)
            .select()
            .single()

        if (error) throw error
        return data as ProgramaAnual
    },

    async addActividad(actividad: Partial<ActividadPrograma>) {
        const { data, error } = await supabase
            .from('actividades_programa')
            .insert(actividad)
            .select()
            .single()

        if (error) throw error
        return data as ActividadPrograma
    },

    // Generador Inteligente: Crea actividades basadas en los Riesgos detectados (EJE 5)
    async generarPropuestaActividades(programaId: string, empresaId: string) {
        // 1. Obtener Riesgos Altos de la Matriz (Simulado query a View)
        // const puestosCriticos = await supabase...

        // Lógica simulada de generación automática
        const propuestas = [
            {
                programa_id: programaId,
                nombre: 'Campaña de Audiometrías (Personal Operativo)',
                tipo: 'examen_medico',
                fecha_inicio: new Date().getFullYear() + '-03-01',
                fecha_fin: new Date().getFullYear() + '-03-15',
                poblacion_objetivo: 'Operarios y Mantenimiento',
                meta_pacientes: 50,
                estado: 'programada',
                riesgo_asociado_id: 'r-ruido' // ID ficticio o real
            },
            {
                programa_id: programaId,
                nombre: 'Semana de Salud Ergonómica',
                tipo: 'campana_salud',
                fecha_inicio: new Date().getFullYear() + '-06-10',
                fecha_fin: new Date().getFullYear() + '-06-14',
                poblacion_objetivo: 'Administrativos y Almacén',
                meta_pacientes: 120,
                estado: 'programada'
            },
            {
                programa_id: programaId,
                nombre: 'Vacunación Influenza Estacional',
                tipo: 'campana_salud',
                fecha_inicio: new Date().getFullYear() + '-10-01',
                fecha_fin: new Date().getFullYear() + '-10-30',
                poblacion_objetivo: 'Todo el personal',
                meta_pacientes: 200,
                estado: 'programada'
            }
        ]

        const { data, error } = await supabase
            .from('actividades_programa')
            .insert(propuestas)
            .select()

        if (error) throw error
        return data
    }
}
