export type EmployeeStatus = 'activo' | 'baja' | 'permiso';
export type ContractType = 'indeterminado' | 'determinado' | 'prueba';

export interface Employee {
    id: string;
    empresa_id: string;
    usuario_id?: string;
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string;
    apellido?: string;
    email: string;
    email_personal?: string;
    telefono?: string;
    direccion?: string;
    numero_empleado?: string;
    fecha_ingreso: string;
    fecha_nacimiento?: string;
    puesto_id?: string;
    departamento_id?: string;
    salario_mensual?: number;
    salario_diario?: number;
    tipo_contrato?: string;
    dias_vacaciones_disponibles?: number;
    dias_vacaciones_usados?: number;
    estado: string;
    foto_url?: string;
    created_at?: string;
    departamento?: Departamento | string;
    puesto?: Puesto | string;
}

// Alias for legacy support
export type Empleado = Employee;

export interface Departamento {
    id: string;
    empresa_id: string;
    nombre: string;
    codigo?: string;
    descripcion?: string;
}

export interface Puesto {
    id: string;
    departamento_id: string;
    nombre: string;
    descripcion?: string;
    requisitos?: string[];
}

export interface RegistroAsistencia {
    id: string;
    empleado_id: string;
    empleado?: Partial<Employee>;
    fecha: string;
    hora_entrada: string;
    hora_salida?: string;
    retardo_minutos?: number;
    horas_trabajadas?: number;
    tipo: 'presencial' | 'remoto' | 'home_office' | 'campo' | any;
}

export interface SolicitudVacaciones {
    id: string;
    empleado_id: string;
    empleado?: Partial<Employee>;
    fecha_inicio: string;
    fecha_fin: string;
    dias_solicitados: number;
    dias_tomados?: number;
    estado: 'pendiente' | 'aprobada' | 'rechazada';
    observaciones?: string;
    aprobado_por_id?: string;
    fecha_aprobacion?: string;
    created_at?: string;
}

export interface Incidencia {
    id: string;
    empleado_id: string;
    empleado?: Partial<Employee>;
    tipo: 'falta' | 'retardo' | 'permiso' | 'incapacidad' | string;
    fecha: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    estado?: string;
    descripcion: string;
    dias_afectados?: number;
    motivo?: string;
    created_at?: string;
}

export interface TurnoHorario {
    id: string;
    nombre: string;
    hora_entrada: string;
    hora_salida: string;
}

export interface RRHHStats {
    total_empleados: number;
    empleados_activos: number;
    empleados_vacaciones: number;
    empleados_incapacidad: number;
    asistencia_hoy: number;
    ausencias_hoy: number;
    solicitudes_pendientes: number;
    cumpleanos_mes: number;
    aniversarios_mes: number;
}

export interface AlertaRRHH {
    id: string;
    tipo: 'vencimiento_contrato' | 'cumpleanos' | 'ausencia';
    mensaje: string;
    prioridad: 'baja' | 'media' | 'alta';
}

export interface NodoOrganigrama {
    id: string;
    nombre: string;
    puesto: string;
    departamento: string;
    foto_url?: string;
    hijos?: NodoOrganigrama[];
}

export interface FiltrosEmpleado {
    busqueda?: string;
    departamento_id?: string;
    puesto_id?: string;
    estado?: string;
}

export interface FiltrosAsistencia {
    empleado_id?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
}

export interface FiltrosVacaciones {
    empleado_id?: string;
    estado?: string;
}

export interface FiltrosIncidencias {
    empleado_id?: string;
    tipo?: string;
}

// Keep existing types for compatibility
export type VacationStatus = 'pendiente' | 'aprobado' | 'rechazado';
export type VacationType = 'vacaciones' | 'incapacidad' | 'permiso_sin_goce' | 'permiso_con_goce';
export interface VacationRequest extends SolicitudVacaciones { }
export type PayrollStatus = 'borrador' | 'timbrada' | 'pagada' | 'cancelada';
export interface Payroll {
    id: string;
    empresa_id: string;
    periodo_inicio: string;
    periodo_fin: string;
    fecha_pago?: string;
    titulo: string;
    estado: PayrollStatus;
    total_percepciones: number;
    total_deducciones: number;
    total_pagado: number;
    created_at?: string;
}
export interface PayrollDetail {
    id: string;
    nomina_id: string;
    empleado_id: string;
    empleado?: Partial<Employee>;
    dias_trabajados: number;
    salario_base: number;
    total_percepciones: number;
    total_deducciones: number;
    neto_pagar: number;
    desglose_json: Record<string, number>;
}
