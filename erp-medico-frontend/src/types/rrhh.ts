// Tipos para el módulo de Recursos Humanos (RRHH)

// Estados posibles de un empleado
export type EstadoEmpleado = 'activo' | 'inactivo' | 'vacaciones' | 'incapacidad' | 'baja'

// Tipos de incidencia
export type TipoIncidencia = 'falta' | 'retardo' | 'permiso' | 'incapacidad' | 'suspension'

// Estado de solicitud
export type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada'

// Tipo de contrato
export type TipoContrato = 'tiempo_completo' | 'medio_tiempo' | 'temporal' | 'honorarios' | 'practicante'

// Departamento
export interface Departamento {
    id: string
    nombre: string
    descripcion?: string
    responsable_id?: string
    departamento_padre_id?: string
    activo: boolean
    created_at: string
}

// Puesto de trabajo
export interface Puesto {
    id: string
    nombre: string
    descripcion?: string
    departamento_id: string
    nivel_jerarquico: number
    salario_minimo?: number
    salario_maximo?: number
    activo: boolean
}

// Empleado
export interface Empleado {
    id: string
    // Datos personales
    nombre: string
    apellido_paterno: string
    apellido_materno?: string
    fecha_nacimiento: string
    curp?: string
    rfc?: string
    nss?: string // Número de Seguro Social
    email: string
    telefono?: string
    direccion?: string
    foto_url?: string

    // Datos laborales
    numero_empleado: string
    puesto_id: string
    departamento_id: string
    jefe_directo_id?: string
    fecha_ingreso: string
    fecha_baja?: string
    tipo_contrato: TipoContrato
    salario_mensual?: number
    estado: EstadoEmpleado

    // Datos de empresa
    empresa_id: string
    sede_id?: string

    // Vacaciones
    dias_vacaciones_disponibles: number
    dias_vacaciones_usados: number

    // Metadata
    created_at: string
    updated_at?: string

    // Relaciones (pobladas opcionalmente)
    puesto?: Puesto
    departamento?: Departamento
    jefe_directo?: Empleado
}

// Turno / Horario de trabajo
export interface TurnoHorario {
    id: string
    nombre: string
    hora_entrada: string // formato "HH:mm"
    hora_salida: string
    dias_laborales: number[] // 0 = Domingo, 1 = Lunes, etc.
    tolerancia_entrada_minutos: number
    tolerancia_salida_minutos: number
    activo: boolean
}

// Asignación de horario a empleado
export interface HorarioEmpleado {
    id: string
    empleado_id: string
    turno_id: string
    fecha_inicio: string
    fecha_fin?: string
    activo: boolean
    turno?: TurnoHorario
}

// Registro de asistencia (fichaje)
export interface RegistroAsistencia {
    id: string
    empleado_id: string
    fecha: string
    hora_entrada?: string
    hora_salida?: string
    horas_trabajadas?: number
    horas_extra?: number
    retardo_minutos?: number
    tipo: 'normal' | 'home_office' | 'campo'
    notas?: string
    created_at: string

    // Relación
    empleado?: Empleado
}

// Solicitud de vacaciones
export interface SolicitudVacaciones {
    id: string
    empleado_id: string
    fecha_inicio: string
    fecha_fin: string
    dias_solicitados: number
    motivo?: string
    estado: EstadoSolicitud
    aprobado_por_id?: string
    fecha_aprobacion?: string
    comentarios_aprobador?: string
    created_at: string

    // Relaciones
    empleado?: Empleado
    aprobado_por?: Empleado
}

// Incidencia (falta, permiso, incapacidad)
export interface Incidencia {
    id: string
    empleado_id: string
    tipo: TipoIncidencia
    fecha_inicio: string
    fecha_fin?: string
    dias_afectados: number
    motivo?: string
    documento_url?: string // Justificante, certificado médico, etc.
    estado: EstadoSolicitud
    registrado_por_id?: string
    created_at: string

    // Relación
    empleado?: Empleado
}

// Nodo del organigrama (para visualización)
export interface NodoOrganigrama {
    id: string
    nombre: string
    puesto: string
    departamento: string
    foto_url?: string
    hijos: NodoOrganigrama[]
}

// Estadísticas del dashboard RRHH
export interface RRHHStats {
    total_empleados: number
    empleados_activos: number
    empleados_vacaciones: number
    empleados_incapacidad: number
    asistencia_hoy: number
    ausencias_hoy: number
    solicitudes_pendientes: number
    cumpleanos_mes: number
    aniversarios_mes: number
}

// Alerta/Evento RRHH
export interface AlertaRRHH {
    id: string
    tipo: 'cumpleanos' | 'aniversario' | 'vencimiento_contrato' | 'vacaciones_proximas' | 'incidencia'
    mensaje: string
    empleado_id: string
    fecha: string
    leida: boolean
    empleado?: Empleado
}

// Filtros para listados
export interface FiltrosEmpleado {
    busqueda?: string
    departamento_id?: string
    puesto_id?: string
    estado?: EstadoEmpleado
    tipo_contrato?: TipoContrato
}

export interface FiltrosAsistencia {
    empleado_id?: string
    departamento_id?: string
    fecha_inicio?: string
    fecha_fin?: string
}

export interface FiltrosVacaciones {
    empleado_id?: string
    estado?: EstadoSolicitud
    fecha_inicio?: string
    fecha_fin?: string
}

export interface FiltrosIncidencias {
    empleado_id?: string
    tipo?: TipoIncidencia
    estado?: EstadoSolicitud
    fecha_inicio?: string
    fecha_fin?: string
}
