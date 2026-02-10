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
        // 1. Crear Cabecera en `recetas`
        const { data: recetaData, error: recetaError } = await supabase
            .from('recetas')
            .insert({
                paciente_id: receta.paciente_id,
                medico_id: receta.medico_id,
                empresa_id: receta.empresa_id, // Añadido en migración
                diagnostico: receta.diagnostico_principal,
                estado: 'activa',
                // Guardar extras en metadata JSONB
                metadata: {
                    alergias: receta.alergias_conocidas,
                    peso: receta.peso_kg,
                    talla: receta.talla_cm
                }
            })
            .select()
            .single()

        if (recetaError) throw recetaError

        // 2. Crear Detalles en `recetas_detalle`
        // Preparamos los datos para inserción (solo columnas válidas)
        const dbDetalles = detalles.map(d => ({
            receta_id: recetaData.id,
            medicamento_nombre: d.nombre_medicamento,
            dosis: d.dosis,
            frecuencia: d.frecuencia,
            duracion: d.duracion,
            cantidad_solicitada: d.cantidad,
            via_administracion: d.via_administracion
        }))

        const { error: detallesError } = await supabase
            .from('recetas_detalle')
            .insert(dbDetalles)

        if (detallesError) throw detallesError

        // 3. Registrar Evento Clínico (Historial Unificado)
        // Esto asegura que la receta aparezca en el Timeline del paciente
        await supabase.from('eventos_clinicos').insert({
            paciente_id: receta.paciente_id,
            empresa_id: receta.empresa_id,
            tipo_evento: 'receta', // Debe coincidir con filtro de historial
            descripcion: `Receta folio ${recetaData.id.slice(0, 8)}: ${receta.diagnostico_principal || 'Sin diagnóstico'}`,
            metadata: { prescripcion_id: recetaData.id },
            created_by: receta.medico_id
        })

        // 4. ACTUALIZAR INVENTARIO (EJE 13)
        // Usamos los detalles originales que traen inventario_id
        try {
            await Promise.all(detalles.map(async (detalle) => {
                if (detalle.inventario_id) {
                    await inventoryService.registrarMovimiento({
                        empresa_id: receta.empresa_id!,
                        usuario_id: receta.medico_id!,
                        item_id: detalle.inventario_id,
                        tipo_movimiento: 'salida_receta',
                        cantidad: detalle.cantidad, // Service handles absolute value
                        observaciones: `Dispensación receta ${recetaData.id.slice(0, 8)}`,
                        referencia_id: recetaData.id,
                        origen_ref: 'receta'
                    })
                }
            }))
        } catch (invError) {
            console.error('Error actualizando inventario:', invError)
        }

        return recetaData
    },

    async getRecetasPaciente(pacienteId: string) {
        const { data, error } = await supabase
            .from('recetas')
            .select(`
                *,
                detalles:recetas_detalle(*),
                medico:profiles(nombre, apellido_paterno, especialidad)
            `)
            .eq('paciente_id', pacienteId)
            .order('created_at', { ascending: false })

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
