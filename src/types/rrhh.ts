export type EmployeeStatus = 'activo' | 'baja' | 'permiso';
export type ContractType = 'indeterminado' | 'determinado' | 'prueba';

export interface Employee {
    id: string;
    empresa_id: string;
    usuario_id?: string;
    nombre: string;
    apellido: string;
    email_personal?: string;
    telefono?: string;
    direccion?: string;
    numero_empleado?: string;
    fecha_ingreso: string; // ISO Date
    puesto: string;
    departamento?: string;
    tipo_contrato?: ContractType;
    rfc?: string;
    curp?: string;
    nss?: string;
    salario_diario?: number;
    cuenta_bancaria?: string;
    banco?: string;
    estado: EmployeeStatus;
    foto_url?: string;
    fecha_baja?: string;
    motivo_baja?: string;
    created_at?: string;
}

export type VacationStatus = 'pendiente' | 'aprobado' | 'rechazado';
export type VacationType = 'vacaciones' | 'incapacidad' | 'permiso_sin_goce' | 'permiso_con_goce';

export interface VacationRequest {
    id: string;
    empresa_id: string;
    empleado_id: string;
    empleado?: Partial<Employee>; // Joined
    tipo: VacationType;
    fecha_inicio: string;
    fecha_fin: string;
    dias_tomados: number;
    estado: VacationStatus;
    observaciones?: string;
    aprobado_por?: string;
    created_at?: string;
}

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
