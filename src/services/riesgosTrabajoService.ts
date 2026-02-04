import { supabase } from '@/lib/supabase'

export interface RiesgoTrabajo {
    id: string
    empresa_id: string
    paciente_id: string
    encuentro_id?: string
    folio?: string
    tipo_riesgo: 'accidente_trabajo' | 'accidente_trayecto' | 'enfermedad_trabajo'
    fecha_ocurrencia: string
    fecha_atencion: string
    lugar_accidente?: string
    direccion_accidente?: string
    descripcion_accidente: string
    causa_externa?: string
    region_anatomica?: string
    tipo_lesion?: string
    diagnostico_inicial?: string
    diagnostico_cie10?: string
    testigo_nombre?: string
    testigo_puesto?: string
    estado: string
    medico_id?: string
}

export interface Incapacidad {
    id: string
    empresa_id: string
    riesgo_trabajo_id?: string
    paciente_id: string
    folio_incapacidad?: string
    numero_consecutivo: number
    tipo_incapacidad: 'temporal' | 'parcial_permanente' | 'total_permanente' | 'defuncion'
    porcentaje_valuacion?: number
    fecha_inicio: string
    fecha_fin?: string
    dias_incapacidad: number
    diagnostico_definitivo?: string
    pronostico?: string
    secuelas?: string
    recomendaciones_reintegracion?: string
    requiere_seguimiento: boolean
    fecha_proxima_valoracion?: string
    medico_id?: string
    cedula_medico?: string
    estado: string
}

export const riesgosTrabajoService = {
    // Obtener todos los riesgos de trabajo
    async getAll() {
        const { data, error } = await supabase
            .from('riesgos_trabajo')
            .select(`
                *,
                paciente:pacientes(id, nombre, apellido_paterno, apellido_materno, nss, curp, puesto),
                medico:profiles(id, nombre, apellido_paterno)
            `)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    // Obtener riesgos de un paciente
    async getByPaciente(pacienteId: string) {
        const { data, error } = await supabase
            .from('riesgos_trabajo')
            .select('*')
            .eq('paciente_id', pacienteId)
            .order('fecha_ocurrencia', { ascending: false })

        if (error) throw error
        return data || []
    },

    // Crear riesgo de trabajo (ST-7)
    async create(riesgo: Partial<RiesgoTrabajo>) {
        // Generar folio
        const year = new Date().getFullYear()
        const { count } = await supabase
            .from('riesgos_trabajo')
            .select('*', { count: 'exact', head: true })

        const folio = `RT-${year}-${String((count || 0) + 1).padStart(6, '0')}`

        const { data, error } = await supabase
            .from('riesgos_trabajo')
            .insert({
                ...riesgo,
                folio,
                estado: 'abierto'
            })
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Actualizar riesgo
    async update(id: string, riesgo: Partial<RiesgoTrabajo>) {
        const { data, error } = await supabase
            .from('riesgos_trabajo')
            .update({
                ...riesgo,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Cerrar caso
    async cerrarCaso(id: string) {
        return this.update(id, { estado: 'cerrado' })
    }
}

export const incapacidadesService = {
    // Obtener todas las incapacidades
    async getAll() {
        const { data, error } = await supabase
            .from('incapacidades')
            .select(`
                *,
                paciente:pacientes(id, nombre, apellido_paterno, apellido_materno, nss),
                riesgo:riesgos_trabajo(id, folio, tipo_riesgo, fecha_ocurrencia),
                medico:profiles(id, nombre, apellido_paterno, cedula_profesional)
            `)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data || []
    },

    // Obtener incapacidades de un paciente
    async getByPaciente(pacienteId: string) {
        const { data, error } = await supabase
            .from('incapacidades')
            .select('*')
            .eq('paciente_id', pacienteId)
            .order('fecha_inicio', { ascending: false })

        if (error) throw error
        return data || []
    },

    // Obtener incapacidades de un riesgo de trabajo
    async getByRiesgo(riesgoId: string) {
        const { data, error } = await supabase
            .from('incapacidades')
            .select('*')
            .eq('riesgo_trabajo_id', riesgoId)
            .order('numero_consecutivo', { ascending: true })

        if (error) throw error
        return data || []
    },

    // Crear incapacidad (ST-9)
    async create(incapacidad: Partial<Incapacidad>) {
        // Calcular número consecutivo
        let numeroConsecutivo = 1
        if (incapacidad.riesgo_trabajo_id) {
            const previas = await this.getByRiesgo(incapacidad.riesgo_trabajo_id)
            numeroConsecutivo = previas.length + 1
        }

        // Calcular días acumulados
        const diasPrevios = incapacidad.riesgo_trabajo_id
            ? (await this.getByRiesgo(incapacidad.riesgo_trabajo_id))
                .reduce((sum, i) => sum + (i.dias_incapacidad || 0), 0)
            : 0

        const { data, error } = await supabase
            .from('incapacidades')
            .insert({
                ...incapacidad,
                numero_consecutivo: numeroConsecutivo,
                estado: 'vigente'
            })
            .select()
            .single()

        if (error) throw error
        return { ...data, dias_acumulados: diasPrevios + (data.dias_incapacidad || 0) }
    },

    // Prorrogar incapacidad
    async prorrogar(incapacidadId: string, nuevaFechaFin: string, diasAdicionales: number) {
        const original = await supabase
            .from('incapacidades')
            .select('*')
            .eq('id', incapacidadId)
            .single()

        if (original.error) throw original.error

        // Marcar la anterior como prorrogada
        await supabase
            .from('incapacidades')
            .update({ estado: 'prorrogada' })
            .eq('id', incapacidadId)

        // Crear nueva incapacidad subsecuente
        return this.create({
            ...original.data,
            id: undefined,
            folio_incapacidad: undefined,
            fecha_inicio: original.data.fecha_fin,
            fecha_fin: nuevaFechaFin,
            dias_incapacidad: diasAdicionales
        })
    },

    // Dar alta
    async darAlta(id: string, observaciones?: string) {
        const { data, error } = await supabase
            .from('incapacidades')
            .update({
                estado: 'alta',
                recomendaciones_reintegracion: observaciones,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data
    },

    // Estadísticas
    async getEstadisticas(empresaId?: string) {
        let query = supabase.from('incapacidades').select('*')
        if (empresaId) query = query.eq('empresa_id', empresaId)

        const { data, error } = await query
        if (error) throw error

        const incapacidades = data || []
        const hoy = new Date()

        return {
            total: incapacidades.length,
            vigentes: incapacidades.filter(i => i.estado === 'vigente').length,
            diasTotales: incapacidades.reduce((sum, i) => sum + (i.dias_incapacidad || 0), 0),
            porTipo: {
                temporal: incapacidades.filter(i => i.tipo_incapacidad === 'temporal').length,
                parcial_permanente: incapacidades.filter(i => i.tipo_incapacidad === 'parcial_permanente').length,
                total_permanente: incapacidades.filter(i => i.tipo_incapacidad === 'total_permanente').length
            },
            proximasAVencer: incapacidades.filter(i => {
                if (!i.fecha_fin || i.estado !== 'vigente') return false
                const fin = new Date(i.fecha_fin)
                const diff = (fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24)
                return diff >= 0 && diff <= 3
            }).length
        }
    }
}
