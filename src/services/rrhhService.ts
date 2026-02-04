// Servicio de datos reales para RRHH usando Supabase
import { supabase } from '@/lib/supabase'
import type {
    Employee,
    Empleado,
    Departamento,
    Puesto,
    RegistroAsistencia,
    SolicitudVacaciones,
    Incidencia,
    TurnoHorario,
    RRHHStats,
    AlertaRRHH,
    NodoOrganigrama,
    FiltrosEmpleado,
    FiltrosAsistencia,
    FiltrosVacaciones,
    FiltrosIncidencias
} from '@/types/rrhh'

// ============ SERVICIO REAL ============

// --- DEPARTAMENTOS ---
export async function getDepartamentos(): Promise<Departamento[]> {
    const { data, error } = await supabase
        .from('departamentos')
        .select('*')
        .order('nombre')

    if (error) {
        console.error('Error fetching departamentos:', error)
        return []
    }
    return data || []
}

export async function getDepartamentoById(id: string): Promise<Departamento | undefined> {
    const { data, error } = await supabase
        .from('departamentos')
        .select('*')
        .eq('id', id)
        .single()

    if (error) return undefined
    return data
}

// --- PUESTOS ---
export async function getPuestos(): Promise<Puesto[]> {
    const { data, error } = await supabase
        .from('puestos')
        .select('*')
        .order('nombre')

    if (error) {
        console.error('Error fetching puestos:', error)
        return []
    }
    return data || []
}

export async function getPuestoById(id: string): Promise<Puesto | undefined> {
    const { data, error } = await supabase
        .from('puestos')
        .select('*')
        .eq('id', id)
        .single()

    if (error) return undefined
    return data
}

// --- EMPLEADOS ---
export async function getEmpleados(filtros?: FiltrosEmpleado): Promise<Empleado[]> {
    let query = supabase
        .from('usuarios')
        .select(`
            *,
            empleados_detalles!left (
                *,
                departamento:departamentos(*),
                puesto:puestos(*)
            )
        `)

    const { data, error } = await query

    if (error) {
        console.error('Error fetching empleados:', error)
        return []
    }

    // Mapear resultado de Supabase a la estructura de Empleado del frontend
    const empleados: Empleado[] = data.map((u: any) => {
        const detalle = u.empleados_detalles?.[0] || {}
        return {
            id: u.id,
            nombre: u.nombre,
            apellido_paterno: u.apellido_paterno,
            apellido_materno: u.apellido_materno,
            email: u.email,
            telefono: u.telefono,
            foto_url: u.avatar_url,

            // Datos del detalle
            fecha_nacimiento: detalle?.fecha_nacimiento || '1990-01-01', // Default mientras se implementa
            numero_empleado: detalle?.numero_empleado || 'S/N',
            fecha_ingreso: detalle?.fecha_ingreso || u.created_at,
            puesto_id: detalle?.puesto_id,
            departamento_id: detalle?.departamento_id,
            salario_mensual: detalle?.salario_mensual || 0,
            tipo_contrato: detalle?.tipo_contrato || 'indefinido',
            dias_vacaciones_disponibles: detalle?.dias_vacaciones_disponibles || 0,
            dias_vacaciones_usados: detalle?.dias_vacaciones_usados || 0,

            estado: u.activo || true ? 'activo' : 'inactivo', // Asumir activo si no hay campo
            empresa_id: u.empresa_id,
            created_at: u.created_at,
            // Objetos anidados
            departamento: detalle?.departamento,
            puesto: detalle?.puesto
        }
    })

    let resultado = empleados

    if (filtros) {
        if (filtros.busqueda) {
            const b = filtros.busqueda.toLowerCase()
            resultado = resultado.filter(e =>
                e.nombre.toLowerCase().includes(b) ||
                e.apellido_paterno.toLowerCase().includes(b)
            )
        }
        if (filtros.departamento_id) {
            resultado = resultado.filter(e => e.departamento_id === filtros.departamento_id)
        }
    }

    return resultado
}

export async function getEmpleadoById(id: string): Promise<Empleado | undefined> {
    const { data: u, error } = await supabase
        .from('usuarios')
        .select(`
            *,
            empleados_detalles!left (
                *,
                departamento:departamentos(*),
                puesto:puestos(*)
            )
        `)
        .eq('id', id)
        .single()

    if (error || !u) return undefined

    const detalle = (u as any).empleados_detalles?.[0] || {}

    return {
        id: u.id,
        nombre: u.nombre,
        apellido_paterno: u.apellido_paterno,
        apellido_materno: u.apellido_materno,
        email: u.email,
        telefono: u.telefono,
        foto_url: u.avatar_url,
        fecha_nacimiento: detalle?.fecha_nacimiento || '1990-01-01',
        numero_empleado: detalle.numero_empleado,
        fecha_ingreso: detalle?.fecha_ingreso,
        puesto_id: detalle?.puesto_id,
        departamento_id: detalle?.departamento_id,
        salario_mensual: detalle?.salario_mensual,
        tipo_contrato: detalle?.tipo_contrato,
        dias_vacaciones_disponibles: detalle?.dias_vacaciones_disponibles,
        dias_vacaciones_usados: detalle?.dias_vacaciones_usados,
        estado: (u as any).activo ? 'activo' : 'inactivo',
        empresa_id: u.empresa_id,
        created_at: u.created_at,
        departamento: detalle?.departamento,
        puesto: detalle?.puesto
    }
}

// --- ASISTENCIA ---
export async function getAsistencia(filtros?: FiltrosAsistencia): Promise<RegistroAsistencia[]> {
    let query = supabase
        .from('rrhh_asistencia')
        .select(`
            *,
            empleado:usuarios(nombre, apellido_paterno, avatar_url)
        `)
        .order('created_at', { ascending: false })

    if (filtros?.empleado_id) {
        query = query.eq('empleado_id', filtros.empleado_id)
    }

    if (filtros?.fecha_inicio) {
        query = query.gte('fecha', filtros.fecha_inicio)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching asistencia:', error)
        return []
    }

    return data.map((a: any) => ({
        ...a,
        empleado: a.empleado ? {
            id: a.empleado_id, // Usar ID real del registro
            nombre: a.empleado.nombre,
            apellido_paterno: a.empleado.apellido_paterno,
            foto_url: a.empleado.avatar_url
        } : undefined
    }))
}

export async function registrarEntrada(empleado_id: string): Promise<RegistroAsistencia> {
    const ahora = new Date()
    const registro = {
        empleado_id,
        fecha: ahora.toISOString().split('T')[0],
        hora_entrada: ahora.toTimeString().slice(0, 5),
        tipo: 'presencial'
    }

    const { data, error } = await supabase
        .from('rrhh_asistencia')
        .insert(registro)
        .select()
        .single()

    if (error) throw error
    return data
}

export async function registrarSalida(registro_id: string): Promise<RegistroAsistencia | undefined> {
    const ahora = new Date()

    const { data, error } = await supabase
        .from('rrhh_asistencia')
        .update({
            hora_salida: ahora.toTimeString().slice(0, 5)
        })
        .eq('id', registro_id)
        .select()
        .single()

    if (error) throw error
    return data
}

// --- VACACIONES ---
export async function getVacaciones(filtros?: FiltrosVacaciones): Promise<SolicitudVacaciones[]> {
    let query = supabase
        .from('rrhh_vacaciones')
        .select(`
            *,
            empleado:usuarios(nombre, apellido_paterno)
        `)
        .order('created_at', { ascending: false })

    if (filtros?.empleado_id) {
        query = query.eq('empleado_id', filtros.empleado_id)
    }
    if (filtros?.estado) {
        query = query.eq('estado', filtros.estado)
    }

    const { data, error } = await query
    if (error) return []
    return data
}

export async function solicitarVacaciones(data: Omit<SolicitudVacaciones, 'id' | 'estado' | 'created_at'>): Promise<SolicitudVacaciones> {
    const { data: nueva, error } = await supabase
        .from('rrhh_vacaciones')
        .insert({
            ...data,
            estado: 'pendiente'
        })
        .select()
        .single()

    if (error) throw error
    return nueva
}

export async function aprobarVacaciones(id: string, aprobador_id: string, aprobado: boolean): Promise<SolicitudVacaciones | undefined> {
    const { data, error } = await supabase
        .from('rrhh_vacaciones')
        .update({
            estado: aprobado ? 'aprobada' : 'rechazada',
            aprobado_por_id: aprobador_id,
            fecha_aprobacion: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

    if (error) return undefined
    return data
}


// --- INCIDENCIAS ---
export async function getIncidencias(filtros?: FiltrosIncidencias): Promise<Incidencia[]> {
    const { data, error } = await supabase
        .from('rrhh_incidencias')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) return []
    return data
}

export async function crearIncidencia(data: Omit<Incidencia, 'id' | 'created_at'>): Promise<Incidencia> {
    const { data: nueva, error } = await supabase
        .from('rrhh_incidencias')
        .insert(data)
        .select()
        .single()

    if (error) throw error
    return nueva
}


// --- ESTADÍSTICAS ---
export async function getRRHHStats(): Promise<RRHHStats> {
    // Implementación simplificada para demo real
    const hoy = new Date().toISOString().split('T')[0]

    const { count: total } = await supabase.from('usuarios').select('*', { count: 'exact', head: true })
    const { count: asistencia } = await supabase.from('rrhh_asistencia').select('*', { count: 'exact', head: true }).eq('fecha', hoy)

    return {
        total_empleados: total || 0,
        empleados_activos: total || 0,
        empleados_vacaciones: 0,
        empleados_incapacidad: 0,
        asistencia_hoy: asistencia || 0,
        ausencias_hoy: (total || 0) - (asistencia || 0),
        solicitudes_pendientes: 0,
        cumpleanos_mes: 0,
        aniversarios_mes: 0
    }
}

// --- ALERTAS ---
export async function getAlertasRRHH(): Promise<AlertaRRHH[]> {
    return [] // Implementar sistema de alertas real luego v2
}

// --- ORGANIGRAMA ---
export async function getOrganigrama(): Promise<NodoOrganigrama> {
    // Placeholder para evitar errores de renderizado si no hay datos complejos aún
    return {
        id: 'root',
        nombre: 'Organigrama',
        puesto: 'Raíz',
        departamento: 'General',
        hijos: []
    }
}

// --- MÉTODOS CRUD EMPLEADO FALTANTES ---
export async function createEmpleado(data: any): Promise<any> { throw new Error('Not implemented yet in UI') }
export async function updateEmpleado(id: string, data: any): Promise<any> {
    console.log('Update empleado mock', id, data)
    return undefined
}
export async function deleteEmpleado(id: string): Promise<boolean> { return true }
export async function getTurnos(): Promise<TurnoHorario[]> { return [] }
