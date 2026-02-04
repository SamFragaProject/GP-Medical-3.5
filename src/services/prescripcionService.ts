import { supabase } from '@/lib/supabase'
import { inventoryService } from './inventoryService'

export interface RecetaMedica {
    id: string
    paciente_id: string
    empresa_id?: string
    medico_id: string
    fecha_emision: string
    diagnostico_principal?: string
    alergias_conocidas?: string
    peso_kg?: number
    talla_cm?: number
    detalles?: DetalleReceta[]
    estado: 'activa' | 'surtida' | 'cancelada'
}

export interface DetalleReceta {
    id: string
    receta_id: string
    nombre_medicamento: string
    presentacion?: string
    cantidad: number
    dosis: string
    frecuencia: string
    duracion: string
    via_administracion?: string
    observaciones?: string
    inventario_id?: string // Link to Inventory
}

export interface Incapacidad {
    id: string
    paciente_id: string
    medico_id: string
    folio_interno?: string
    tipo_incapacidad: 'riesgo_trabajo' | 'enfermedad_general' | 'maternidad'
    ramo_seguro?: string
    fecha_inicio: string
    dias_autorizados: number
    fecha_fin: string // Computed
    diagnostico_cie10?: string
    descripcion_motivo?: string
    estado: 'emitida' | 'cancelada'
}

export const prescripcionService = {
    // === RECETAS ===
    async createReceta(receta: Partial<RecetaMedica>, detalles: Omit<DetalleReceta, 'id' | 'receta_id'>[]) {
        // 1. Crear Cabecera
        const { data: recetaData, error: recetaError } = await supabase
            .from('recetas_medicas')
            .insert(receta)
            .select()
            .single()

        if (recetaError) throw recetaError

        // 2. Crear Detalles
        const detallesConId = detalles.map(d => ({
            ...d,
            receta_id: recetaData.id
        }))

        const { error: detallesError } = await supabase
            .from('detalles_receta')
            .insert(detallesConId)

        if (detallesError) throw detallesError

        // 3. ACTUALIZAR INVENTARIO (EJE 13)
        // Descontar stock si el medicamento proviene del inventario
        try {
            await Promise.all(detallesConId.map(async (detalle) => {
                if (detalle.inventario_id) {
                    await inventoryService.registrarMovimiento({
                        empresa_id: receta.empresa_id!,
                        item_id: detalle.inventario_id,
                        tipo_movimiento: 'salida_receta',
                        cantidad: detalle.cantidad,
                        referencia_id: recetaData.id,
                        origen_ref: 'recetas_medicas',
                        usuario_id: receta.medico_id,
                        observaciones: `Receta Folio: ${recetaData.id.slice(0, 8)}`
                    })
                }
            }))
        } catch (invError) {
            console.error('Error actualizando inventario:', invError)
            // No bloqueamos la receta si falla el inventario, pero alertamos (o manejamos rollback idealmente)
        }

        return recetaData
    },

    async getRecetasPaciente(pacienteId: string) {
        const { data, error } = await supabase
            .from('recetas_medicas')
            .select(`
                *,
                detalles:detalles_receta(*),
                medico:profiles(full_name, especialidad)
            `)
            .eq('paciente_id', pacienteId)
            .order('fecha_emision', { ascending: false })

        if (error) throw error
        return data as RecetaMedica[]
    },

    // === INCAPACIDADES ===
    async createIncapacidad(incapacidad: Partial<Incapacidad>) {
        const { data, error } = await supabase
            .from('incapacidades')
            .insert(incapacidad)
            .select()
            .single()

        if (error) throw error
        return data as Incapacidad
    },

    async getIncapacidades(empresaId: string) {
        const { data, error } = await supabase
            .from('incapacidades')
            .select(`
                *,
                paciente:pacientes(nombre, apellido_paterno, nss)
            `)
            .eq('empresa_id', empresaId)
            .order('fecha_inicio', { ascending: false })

        if (error) throw error
        return data
    }
}
