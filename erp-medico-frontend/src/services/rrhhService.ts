// Servicio de datos para el módulo RRHH
// Conexión externa pendiente - usando datos mock

import type {
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

// ============ DATOS MOCK ============

const DEPARTAMENTOS_MOCK: Departamento[] = [
    { id: 'dep-1', nombre: 'Dirección General', descripcion: 'Alta dirección', activo: true, created_at: '2024-01-01' },
    { id: 'dep-2', nombre: 'Medicina del Trabajo', descripcion: 'Servicios médicos ocupacionales', responsable_id: 'emp-1', activo: true, created_at: '2024-01-01' },
    { id: 'dep-3', nombre: 'Administración', descripcion: 'Gestión administrativa y financiera', activo: true, created_at: '2024-01-01' },
    { id: 'dep-4', nombre: 'Recepción', descripcion: 'Atención al paciente', departamento_padre_id: 'dep-3', activo: true, created_at: '2024-01-01' },
    { id: 'dep-5', nombre: 'Laboratorio', descripcion: 'Análisis clínicos', activo: true, created_at: '2024-01-01' },
    { id: 'dep-6', nombre: 'Rayos X', descripcion: 'Imagenología', activo: true, created_at: '2024-01-01' },
]

const PUESTOS_MOCK: Puesto[] = [
    { id: 'pue-1', nombre: 'Director General', departamento_id: 'dep-1', nivel_jerarquico: 1, activo: true },
    { id: 'pue-2', nombre: 'Médico del Trabajo', departamento_id: 'dep-2', nivel_jerarquico: 2, activo: true },
    { id: 'pue-3', nombre: 'Enfermera', departamento_id: 'dep-2', nivel_jerarquico: 3, activo: true },
    { id: 'pue-4', nombre: 'Administrador', departamento_id: 'dep-3', nivel_jerarquico: 2, activo: true },
    { id: 'pue-5', nombre: 'Recepcionista', departamento_id: 'dep-4', nivel_jerarquico: 4, activo: true },
    { id: 'pue-6', nombre: 'Químico', departamento_id: 'dep-5', nivel_jerarquico: 3, activo: true },
    { id: 'pue-7', nombre: 'Técnico Radiólogo', departamento_id: 'dep-6', nivel_jerarquico: 3, activo: true },
]

const EMPLEADOS_MOCK: Empleado[] = [
    {
        id: 'emp-1',
        nombre: 'Carlos',
        apellido_paterno: 'Rodríguez',
        apellido_materno: 'García',
        fecha_nacimiento: '1975-03-15',
        email: 'carlos.rodriguez@gpmedical.mx',
        telefono: '555-0101',
        numero_empleado: 'EMP-001',
        puesto_id: 'pue-1',
        departamento_id: 'dep-1',
        fecha_ingreso: '2020-01-15',
        tipo_contrato: 'tiempo_completo',
        salario_mensual: 75000,
        estado: 'activo',
        empresa_id: 'empresa-1',
        dias_vacaciones_disponibles: 15,
        dias_vacaciones_usados: 5,
        created_at: '2020-01-15',
        foto_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos'
    },
    {
        id: 'emp-2',
        nombre: 'María',
        apellido_paterno: 'González',
        apellido_materno: 'López',
        fecha_nacimiento: '1985-07-22',
        email: 'maria.gonzalez@gpmedical.mx',
        telefono: '555-0102',
        numero_empleado: 'EMP-002',
        puesto_id: 'pue-2',
        departamento_id: 'dep-2',
        jefe_directo_id: 'emp-1',
        fecha_ingreso: '2021-03-01',
        tipo_contrato: 'tiempo_completo',
        salario_mensual: 45000,
        estado: 'activo',
        empresa_id: 'empresa-1',
        dias_vacaciones_disponibles: 12,
        dias_vacaciones_usados: 2,
        created_at: '2021-03-01',
        foto_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria'
    },
    {
        id: 'emp-3',
        nombre: 'Ana',
        apellido_paterno: 'Martínez',
        apellido_materno: 'Ruiz',
        fecha_nacimiento: '1990-11-08',
        email: 'ana.martinez@gpmedical.mx',
        telefono: '555-0103',
        numero_empleado: 'EMP-003',
        puesto_id: 'pue-3',
        departamento_id: 'dep-2',
        jefe_directo_id: 'emp-2',
        fecha_ingreso: '2022-06-15',
        tipo_contrato: 'tiempo_completo',
        salario_mensual: 22000,
        estado: 'activo',
        empresa_id: 'empresa-1',
        dias_vacaciones_disponibles: 10,
        dias_vacaciones_usados: 0,
        created_at: '2022-06-15',
        foto_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ana'
    },
    {
        id: 'emp-4',
        nombre: 'Roberto',
        apellido_paterno: 'Sánchez',
        apellido_materno: 'Pérez',
        fecha_nacimiento: '1988-04-30',
        email: 'roberto.sanchez@gpmedical.mx',
        telefono: '555-0104',
        numero_empleado: 'EMP-004',
        puesto_id: 'pue-4',
        departamento_id: 'dep-3',
        jefe_directo_id: 'emp-1',
        fecha_ingreso: '2020-08-01',
        tipo_contrato: 'tiempo_completo',
        salario_mensual: 35000,
        estado: 'activo',
        empresa_id: 'empresa-1',
        dias_vacaciones_disponibles: 14,
        dias_vacaciones_usados: 8,
        created_at: '2020-08-01',
        foto_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto'
    },
    {
        id: 'emp-5',
        nombre: 'Laura',
        apellido_paterno: 'Hernández',
        apellido_materno: 'Torres',
        fecha_nacimiento: '1995-09-12',
        email: 'laura.hernandez@gpmedical.mx',
        telefono: '555-0105',
        numero_empleado: 'EMP-005',
        puesto_id: 'pue-5',
        departamento_id: 'dep-4',
        jefe_directo_id: 'emp-4',
        fecha_ingreso: '2023-02-01',
        tipo_contrato: 'tiempo_completo',
        salario_mensual: 15000,
        estado: 'vacaciones',
        empresa_id: 'empresa-1',
        dias_vacaciones_disponibles: 6,
        dias_vacaciones_usados: 6,
        created_at: '2023-02-01',
        foto_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura'
    },
    {
        id: 'emp-6',
        nombre: 'Pedro',
        apellido_paterno: 'Díaz',
        apellido_materno: 'Morales',
        fecha_nacimiento: '1982-12-05',
        email: 'pedro.diaz@gpmedical.mx',
        telefono: '555-0106',
        numero_empleado: 'EMP-006',
        puesto_id: 'pue-6',
        departamento_id: 'dep-5',
        jefe_directo_id: 'emp-2',
        fecha_ingreso: '2021-09-15',
        tipo_contrato: 'tiempo_completo',
        salario_mensual: 28000,
        estado: 'activo',
        empresa_id: 'empresa-1',
        dias_vacaciones_disponibles: 11,
        dias_vacaciones_usados: 3,
        created_at: '2021-09-15',
        foto_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro'
    },
    {
        id: 'emp-7',
        nombre: 'Sofía',
        apellido_paterno: 'Ramírez',
        apellido_materno: 'Castro',
        fecha_nacimiento: '1993-06-18',
        email: 'sofia.ramirez@gpmedical.mx',
        telefono: '555-0107',
        numero_empleado: 'EMP-007',
        puesto_id: 'pue-7',
        departamento_id: 'dep-6',
        jefe_directo_id: 'emp-2',
        fecha_ingreso: '2022-11-01',
        tipo_contrato: 'tiempo_completo',
        salario_mensual: 25000,
        estado: 'incapacidad',
        empresa_id: 'empresa-1',
        dias_vacaciones_disponibles: 8,
        dias_vacaciones_usados: 2,
        created_at: '2022-11-01',
        foto_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sofia'
    },
]

const TURNOS_MOCK: TurnoHorario[] = [
    {
        id: 'turno-1',
        nombre: 'Matutino',
        hora_entrada: '08:00',
        hora_salida: '16:00',
        dias_laborales: [1, 2, 3, 4, 5],
        tolerancia_entrada_minutos: 15,
        tolerancia_salida_minutos: 15,
        activo: true
    },
    {
        id: 'turno-2',
        nombre: 'Vespertino',
        hora_entrada: '14:00',
        hora_salida: '22:00',
        dias_laborales: [1, 2, 3, 4, 5],
        tolerancia_entrada_minutos: 15,
        tolerancia_salida_minutos: 15,
        activo: true
    },
]

const hoy = new Date().toISOString().split('T')[0]

const ASISTENCIA_MOCK: RegistroAsistencia[] = [
    { id: 'asi-1', empleado_id: 'emp-1', fecha: hoy, hora_entrada: '07:55', hora_salida: '16:05', horas_trabajadas: 8, tipo: 'normal', created_at: hoy },
    { id: 'asi-2', empleado_id: 'emp-2', fecha: hoy, hora_entrada: '08:10', hora_salida: '16:30', horas_trabajadas: 8, retardo_minutos: 10, tipo: 'normal', created_at: hoy },
    { id: 'asi-3', empleado_id: 'emp-3', fecha: hoy, hora_entrada: '07:50', hora_salida: undefined, horas_trabajadas: undefined, tipo: 'normal', created_at: hoy },
    { id: 'asi-4', empleado_id: 'emp-4', fecha: hoy, hora_entrada: '08:00', hora_salida: undefined, horas_trabajadas: undefined, tipo: 'home_office', created_at: hoy },
    { id: 'asi-5', empleado_id: 'emp-6', fecha: hoy, hora_entrada: '07:58', hora_salida: undefined, horas_trabajadas: undefined, tipo: 'normal', created_at: hoy },
]

const VACACIONES_MOCK: SolicitudVacaciones[] = [
    {
        id: 'vac-1',
        empleado_id: 'emp-5',
        fecha_inicio: '2024-12-09',
        fecha_fin: '2024-12-13',
        dias_solicitados: 5,
        motivo: 'Vacaciones de fin de año',
        estado: 'aprobada',
        aprobado_por_id: 'emp-4',
        fecha_aprobacion: '2024-11-25',
        created_at: '2024-11-20'
    },
    {
        id: 'vac-2',
        empleado_id: 'emp-3',
        fecha_inicio: '2024-12-23',
        fecha_fin: '2024-12-27',
        dias_solicitados: 5,
        motivo: 'Navidad',
        estado: 'pendiente',
        created_at: '2024-12-01'
    },
    {
        id: 'vac-3',
        empleado_id: 'emp-6',
        fecha_inicio: '2025-01-02',
        fecha_fin: '2025-01-10',
        dias_solicitados: 7,
        motivo: 'Viaje familiar',
        estado: 'pendiente',
        created_at: '2024-12-05'
    },
]

const INCIDENCIAS_MOCK: Incidencia[] = [
    {
        id: 'inc-1',
        empleado_id: 'emp-7',
        tipo: 'incapacidad',
        fecha_inicio: '2024-12-10',
        fecha_fin: '2024-12-17',
        dias_afectados: 5,
        motivo: 'Cirugía programada',
        estado: 'aprobada',
        registrado_por_id: 'emp-4',
        created_at: '2024-12-05'
    },
    {
        id: 'inc-2',
        empleado_id: 'emp-2',
        tipo: 'retardo',
        fecha_inicio: hoy,
        dias_afectados: 0,
        motivo: 'Tráfico',
        estado: 'aprobada',
        created_at: hoy
    },
]

// ============ FUNCIONES DEL SERVICIO ============

// Simular delay de red
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// --- DEPARTAMENTOS ---
export async function getDepartamentos(): Promise<Departamento[]> {
    await delay(200)
    return DEPARTAMENTOS_MOCK
}

export async function getDepartamentoById(id: string): Promise<Departamento | undefined> {
    await delay(100)
    return DEPARTAMENTOS_MOCK.find(d => d.id === id)
}

// --- PUESTOS ---
export async function getPuestos(): Promise<Puesto[]> {
    await delay(200)
    return PUESTOS_MOCK
}

export async function getPuestoById(id: string): Promise<Puesto | undefined> {
    await delay(100)
    return PUESTOS_MOCK.find(p => p.id === id)
}

// --- EMPLEADOS ---
export async function getEmpleados(filtros?: FiltrosEmpleado): Promise<Empleado[]> {
    await delay(300)
    let resultado = [...EMPLEADOS_MOCK]

    // Poblar relaciones
    resultado = resultado.map(emp => ({
        ...emp,
        departamento: DEPARTAMENTOS_MOCK.find(d => d.id === emp.departamento_id),
        puesto: PUESTOS_MOCK.find(p => p.id === emp.puesto_id)
    }))

    if (filtros) {
        if (filtros.busqueda) {
            const busq = filtros.busqueda.toLowerCase()
            resultado = resultado.filter(e =>
                e.nombre.toLowerCase().includes(busq) ||
                e.apellido_paterno.toLowerCase().includes(busq) ||
                e.numero_empleado.toLowerCase().includes(busq)
            )
        }
        if (filtros.departamento_id) {
            resultado = resultado.filter(e => e.departamento_id === filtros.departamento_id)
        }
        if (filtros.estado) {
            resultado = resultado.filter(e => e.estado === filtros.estado)
        }
    }

    return resultado
}

export async function getEmpleadoById(id: string): Promise<Empleado | undefined> {
    await delay(150)
    const emp = EMPLEADOS_MOCK.find(e => e.id === id)
    if (!emp) return undefined

    return {
        ...emp,
        departamento: DEPARTAMENTOS_MOCK.find(d => d.id === emp.departamento_id),
        puesto: PUESTOS_MOCK.find(p => p.id === emp.puesto_id)
    }
}

export async function createEmpleado(data: Omit<Empleado, 'id' | 'created_at'>): Promise<Empleado> {
    await delay(300)
    const nuevoEmpleado: Empleado = {
        ...data,
        id: `emp-${Date.now()}`,
        created_at: new Date().toISOString()
    }
    EMPLEADOS_MOCK.push(nuevoEmpleado)
    return nuevoEmpleado
}

export async function updateEmpleado(id: string, data: Partial<Empleado>): Promise<Empleado | undefined> {
    await delay(300)
    const index = EMPLEADOS_MOCK.findIndex(e => e.id === id)
    if (index === -1) return undefined

    EMPLEADOS_MOCK[index] = { ...EMPLEADOS_MOCK[index], ...data, updated_at: new Date().toISOString() }
    return EMPLEADOS_MOCK[index]
}

export async function deleteEmpleado(id: string): Promise<boolean> {
    await delay(200)
    const index = EMPLEADOS_MOCK.findIndex(e => e.id === id)
    if (index === -1) return false
    EMPLEADOS_MOCK.splice(index, 1)
    return true
}

// --- ASISTENCIA ---
export async function getAsistencia(filtros?: FiltrosAsistencia): Promise<RegistroAsistencia[]> {
    await delay(250)
    let resultado = [...ASISTENCIA_MOCK]

    resultado = resultado.map(reg => ({
        ...reg,
        empleado: EMPLEADOS_MOCK.find(e => e.id === reg.empleado_id)
    }))

    if (filtros) {
        if (filtros.empleado_id) {
            resultado = resultado.filter(r => r.empleado_id === filtros.empleado_id)
        }
        if (filtros.fecha_inicio) {
            resultado = resultado.filter(r => r.fecha >= filtros.fecha_inicio!)
        }
        if (filtros.fecha_fin) {
            resultado = resultado.filter(r => r.fecha <= filtros.fecha_fin!)
        }
    }

    return resultado
}

export async function registrarEntrada(empleado_id: string): Promise<RegistroAsistencia> {
    await delay(200)
    const ahora = new Date()
    const registro: RegistroAsistencia = {
        id: `asi-${Date.now()}`,
        empleado_id,
        fecha: ahora.toISOString().split('T')[0],
        hora_entrada: ahora.toTimeString().slice(0, 5),
        tipo: 'normal',
        created_at: ahora.toISOString()
    }
    ASISTENCIA_MOCK.push(registro)
    return registro
}

export async function registrarSalida(registro_id: string): Promise<RegistroAsistencia | undefined> {
    await delay(200)
    const registro = ASISTENCIA_MOCK.find(r => r.id === registro_id)
    if (!registro) return undefined

    const ahora = new Date()
    registro.hora_salida = ahora.toTimeString().slice(0, 5)
    registro.horas_trabajadas = 8 // Simplificado

    return registro
}

// --- VACACIONES ---
export async function getVacaciones(filtros?: FiltrosVacaciones): Promise<SolicitudVacaciones[]> {
    await delay(250)
    let resultado = [...VACACIONES_MOCK]

    resultado = resultado.map(vac => ({
        ...vac,
        empleado: EMPLEADOS_MOCK.find(e => e.id === vac.empleado_id)
    }))

    if (filtros) {
        if (filtros.empleado_id) {
            resultado = resultado.filter(v => v.empleado_id === filtros.empleado_id)
        }
        if (filtros.estado) {
            resultado = resultado.filter(v => v.estado === filtros.estado)
        }
    }

    return resultado
}

export async function solicitarVacaciones(data: Omit<SolicitudVacaciones, 'id' | 'estado' | 'created_at'>): Promise<SolicitudVacaciones> {
    await delay(300)
    const solicitud: SolicitudVacaciones = {
        ...data,
        id: `vac-${Date.now()}`,
        estado: 'pendiente',
        created_at: new Date().toISOString()
    }
    VACACIONES_MOCK.push(solicitud)
    return solicitud
}

export async function aprobarVacaciones(id: string, aprobador_id: string, aprobado: boolean): Promise<SolicitudVacaciones | undefined> {
    await delay(200)
    const solicitud = VACACIONES_MOCK.find(v => v.id === id)
    if (!solicitud) return undefined

    solicitud.estado = aprobado ? 'aprobada' : 'rechazada'
    solicitud.aprobado_por_id = aprobador_id
    solicitud.fecha_aprobacion = new Date().toISOString()

    return solicitud
}

// --- INCIDENCIAS ---
export async function getIncidencias(filtros?: FiltrosIncidencias): Promise<Incidencia[]> {
    await delay(250)
    let resultado = [...INCIDENCIAS_MOCK]

    resultado = resultado.map(inc => ({
        ...inc,
        empleado: EMPLEADOS_MOCK.find(e => e.id === inc.empleado_id)
    }))

    if (filtros) {
        if (filtros.empleado_id) {
            resultado = resultado.filter(i => i.empleado_id === filtros.empleado_id)
        }
        if (filtros.tipo) {
            resultado = resultado.filter(i => i.tipo === filtros.tipo)
        }
        if (filtros.estado) {
            resultado = resultado.filter(i => i.estado === filtros.estado)
        }
    }

    return resultado
}

export async function crearIncidencia(data: Omit<Incidencia, 'id' | 'created_at'>): Promise<Incidencia> {
    await delay(300)
    const incidencia: Incidencia = {
        ...data,
        id: `inc-${Date.now()}`,
        created_at: new Date().toISOString()
    }
    INCIDENCIAS_MOCK.push(incidencia)
    return incidencia
}

// --- TURNOS ---
export async function getTurnos(): Promise<TurnoHorario[]> {
    await delay(200)
    return TURNOS_MOCK
}

// --- ESTADÍSTICAS ---
export async function getRRHHStats(): Promise<RRHHStats> {
    await delay(300)
    const empleadosActivos = EMPLEADOS_MOCK.filter(e => e.estado === 'activo').length
    const empleadosVacaciones = EMPLEADOS_MOCK.filter(e => e.estado === 'vacaciones').length
    const empleadosIncapacidad = EMPLEADOS_MOCK.filter(e => e.estado === 'incapacidad').length
    const solicitudesPendientes = VACACIONES_MOCK.filter(v => v.estado === 'pendiente').length

    return {
        total_empleados: EMPLEADOS_MOCK.length,
        empleados_activos: empleadosActivos,
        empleados_vacaciones: empleadosVacaciones,
        empleados_incapacidad: empleadosIncapacidad,
        asistencia_hoy: ASISTENCIA_MOCK.filter(a => a.fecha === hoy).length,
        ausencias_hoy: EMPLEADOS_MOCK.length - ASISTENCIA_MOCK.filter(a => a.fecha === hoy).length,
        solicitudes_pendientes: solicitudesPendientes,
        cumpleanos_mes: 2,
        aniversarios_mes: 1
    }
}

// --- ALERTAS ---
export async function getAlertasRRHH(): Promise<AlertaRRHH[]> {
    await delay(200)
    const alertas: AlertaRRHH[] = [
        {
            id: 'alerta-1',
            tipo: 'vacaciones_proximas',
            mensaje: 'Laura Hernández está de vacaciones esta semana',
            empleado_id: 'emp-5',
            fecha: hoy,
            leida: false,
            empleado: EMPLEADOS_MOCK.find(e => e.id === 'emp-5')
        },
        {
            id: 'alerta-2',
            tipo: 'incidencia',
            mensaje: 'Sofía Ramírez está en incapacidad médica',
            empleado_id: 'emp-7',
            fecha: hoy,
            leida: false,
            empleado: EMPLEADOS_MOCK.find(e => e.id === 'emp-7')
        },
        {
            id: 'alerta-3',
            tipo: 'cumpleanos',
            mensaje: 'Ana Martínez cumple años el próximo mes',
            empleado_id: 'emp-3',
            fecha: '2024-12-20',
            leida: true,
            empleado: EMPLEADOS_MOCK.find(e => e.id === 'emp-3')
        },
    ]
    return alertas
}

// --- ORGANIGRAMA ---
export async function getOrganigrama(): Promise<NodoOrganigrama> {
    await delay(300)

    const buildTree = (empleadoId?: string): NodoOrganigrama[] => {
        const subordinados = EMPLEADOS_MOCK.filter(e => e.jefe_directo_id === empleadoId)
        return subordinados.map(emp => ({
            id: emp.id,
            nombre: `${emp.nombre} ${emp.apellido_paterno}`,
            puesto: PUESTOS_MOCK.find(p => p.id === emp.puesto_id)?.nombre || '',
            departamento: DEPARTAMENTOS_MOCK.find(d => d.id === emp.departamento_id)?.nombre || '',
            foto_url: emp.foto_url,
            hijos: buildTree(emp.id)
        }))
    }

    const director = EMPLEADOS_MOCK.find(e => !e.jefe_directo_id)!

    return {
        id: director.id,
        nombre: `${director.nombre} ${director.apellido_paterno}`,
        puesto: PUESTOS_MOCK.find(p => p.id === director.puesto_id)?.nombre || '',
        departamento: DEPARTAMENTOS_MOCK.find(d => d.id === director.departamento_id)?.nombre || '',
        foto_url: director.foto_url,
        hijos: buildTree(director.id)
    }
}
