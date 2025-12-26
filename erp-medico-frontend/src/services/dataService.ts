// Servicio de datos reales con Supabase
// Reemplaza mockDataService con queries reales a la base de datos

import { supabase } from '@/lib/supabase'

// ============================================
// TIPOS
// ============================================

export interface Paciente {
    id: string
    empresa_id: string
    empresa_cliente_id?: string
    numero_empleado?: string
    nombre: string
    apellido_paterno: string
    apellido_materno?: string
    curp?: string
    nss?: string
    rfc?: string
    fecha_nacimiento?: string
    genero?: string
    puesto?: string
    departamento?: string
    tipo_sangre?: string
    alergias?: string
    telefono?: string
    email?: string
    foto_url?: string
    estatus: string
    created_at: string
}

export interface Cita {
    id: string
    empresa_id: string
    paciente_id: string
    medico_id?: string
    sede_id?: string
    tipo: string
    fecha: string
    hora_inicio: string
    hora_fin?: string
    estado: string
    notas?: string
    created_at: string
    // Relaciones
    paciente?: Paciente
}

export interface Examen {
    id: string
    empresa_id: string
    paciente_id: string
    cita_id?: string
    tipo: string
    fecha: string
    dictamen?: string
    estado: string
    resultados?: Record<string, any>
}

// ============================================
// SERVICIO DE PACIENTES
// ============================================

export const pacientesService = {
    // Obtener todos los pacientes (filtrado automático por RLS)
    async getAll() {
        const { data, error } = await supabase
            .from('pacientes')
            .select('*')
            .order('apellido_paterno', { ascending: true })

        if (error) {
            console.error('Error fetching pacientes:', error)
            throw error
        }
        return data as Paciente[]
    },

    // Obtener un paciente por ID
    async getById(id: string) {
        const { data, error } = await supabase
            .from('pacientes')
            .select('*')
            .eq('id', id)
            .single()

        if (error) throw error
        return data as Paciente
    },

    // Buscar pacientes
    async search(query: string) {
        const { data, error } = await supabase
            .from('pacientes')
            .select('*')
            .or(`nombre.ilike.%${query}%,apellido_paterno.ilike.%${query}%,curp.ilike.%${query}%`)
            .limit(20)

        if (error) throw error
        return data as Paciente[]
    },

    // Crear paciente
    async create(paciente: Omit<Paciente, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('pacientes')
            .insert(paciente)
            .select()
            .single()

        if (error) throw error
        return data as Paciente
    },

    // Actualizar paciente
    async update(id: string, updates: Partial<Paciente>) {
        const { data, error } = await supabase
            .from('pacientes')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as Paciente
    },

    // Eliminar paciente
    async delete(id: string) {
        const { error } = await supabase
            .from('pacientes')
            .delete()
            .eq('id', id)

        if (error) throw error
    }
}

// ============================================
// SERVICIO DE CITAS
// ============================================

export const citasService = {
    // Obtener citas del día
    async getByDate(fecha: string) {
        const { data, error } = await supabase
            .from('citas')
            .select(`
        *,
        paciente:pacientes(id, nombre, apellido_paterno, apellido_materno, foto_url)
      `)
            .eq('fecha', fecha)
            .order('hora_inicio', { ascending: true })

        if (error) throw error
        return data as Cita[]
    },

    // Obtener citas por rango de fechas
    async getByDateRange(fechaInicio: string, fechaFin: string) {
        const { data, error } = await supabase
            .from('citas')
            .select(`
        *,
        paciente:pacientes(id, nombre, apellido_paterno, foto_url)
      `)
            .gte('fecha', fechaInicio)
            .lte('fecha', fechaFin)
            .order('fecha', { ascending: true })
            .order('hora_inicio', { ascending: true })

        if (error) throw error
        return data as Cita[]
    },

    // Crear cita
    async create(cita: Omit<Cita, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('citas')
            .insert(cita)
            .select()
            .single()

        if (error) throw error
        return data as Cita
    },

    // Actualizar estado de cita
    async updateStatus(id: string, estado: string) {
        const { data, error } = await supabase
            .from('citas')
            .update({ estado })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as Cita
    },

    // Cancelar cita
    async cancel(id: string) {
        return this.updateStatus(id, 'cancelada')
    }
}

// ============================================
// SERVICIO DE EXÁMENES
// ============================================

export const examenesService = {
    // Obtener exámenes de un paciente
    async getByPaciente(pacienteId: string) {
        const { data, error } = await supabase
            .from('examenes')
            .select('*')
            .eq('paciente_id', pacienteId)
            .order('fecha', { ascending: false })

        if (error) throw error
        return data as Examen[]
    },

    // Crear examen
    async create(examen: Omit<Examen, 'id'>) {
        const { data, error } = await supabase
            .from('examenes')
            .insert(examen)
            .select()
            .single()

        if (error) throw error
        return data as Examen
    },

    // Actualizar dictamen
    async updateDictamen(id: string, dictamen: string, restricciones?: string) {
        const { data, error } = await supabase
            .from('examenes')
            .update({ dictamen, restricciones, estado: 'completado' })
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
    }
}

// ============================================
// SERVICIO DE EMPRESAS (SAAS)
// ============================================

export interface Empresa {
    id: string
    nombre: string
    rfc?: string
    razon_social?: string
    direccion?: string
    telefono?: string
    email?: string
    plan: 'basico' | 'profesional' | 'enterprise'
    activo: boolean
    created_at: string
}

export const empresasService = {
    // Obtener todas las empresas (Solo Super Admin)
    async getAll() {
        // En producción, RLS debería permitir esto solo a super admins
        const { data, error } = await supabase
            .from('empresas')
            .select('*')
            .order('created_at', { ascending: false })

        if (error) throw error
        return data as Empresa[]
    },

    // Crear empresa
    async create(empresa: Omit<Empresa, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('empresas')
            .insert(empresa)
            .select()
            .single()

        if (error) throw error
        return data as Empresa
    },

    // Actualizar empresa
    async update(id: string, updates: Partial<Empresa>) {
        const { data, error } = await supabase
            .from('empresas')
            .update(updates)
            .eq('id', id)
            .select()
            .single()

        if (error) throw error
        return data as Empresa
    }
}

// ============================================
// SERVICIO DE ESTADÍSTICAS
// ============================================

export const statsService = {
    // Estadísticas generales del dashboard
    async getDashboardStats() {
        const today = new Date().toISOString().split('T')[0]

        // Conteo de pacientes
        const { count: totalPacientes } = await supabase
            .from('pacientes')
            .select('*', { count: 'exact', head: true })

        // Citas de hoy
        const { count: citasHoy } = await supabase
            .from('citas')
            .select('*', { count: 'exact', head: true })
            .eq('fecha', today)

        // Exámenes pendientes
        const { count: examenesPendientes } = await supabase
            .from('examenes')
            .select('*', { count: 'exact', head: true })
            .eq('estado', 'pendiente')

        return {
            totalPacientes: totalPacientes || 0,
            citasHoy: citasHoy || 0,
            examenesPendientes: examenesPendientes || 0
        }
    }
}

// ============================================
// EXPORT DEFAULT (para compatibilidad)
// ============================================

export const dataService = {
    pacientes: pacientesService,
    citas: citasService,
    examenes: examenesService,
    stats: statsService
}

export default dataService
