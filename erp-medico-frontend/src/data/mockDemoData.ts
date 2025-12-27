/**
 * Mock Demo Data - GPMedical ERP
 * Datos demo coherentes para usar cuando Supabase no está disponible
 * Todos los IDs coinciden con supabase_demo_data_v2.sql
 */

// ============================================
// TIPOS
// ============================================

export interface DemoUser {
    id: string;
    email: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    hierarchy: string;
    empresaId: string;
    sedeId: string;
    telefono?: string;
    cedulaProfesional?: string;
    especialidad?: string;
    avatarUrl?: string;
}

export interface DemoPatient {
    id: string;
    empresaId: string;
    numeroEmpleado: string;
    nombre: string;
    apellidoPaterno: string;
    apellidoMaterno?: string;
    fechaNacimiento: string;
    genero: 'masculino' | 'femenino' | 'otro';
    email?: string;
    telefono?: string;
    puestoTrabajoId?: string;
    estatus: 'activo' | 'inactivo' | 'incapacitado' | 'suspendido';
    nss?: string;
    curp?: string;
    tipoSangre?: string;
    alergias?: string;
    usuarioId?: string; // Si tiene cuenta de usuario
}

export interface DemoAppointment {
    id: string;
    empresaId: string;
    pacienteId: string;
    medicoId?: string;
    tipoCita: string;
    fecha: string;
    horaInicio: string;
    horaFin: string;
    estado: 'programada' | 'confirmada' | 'en_curso' | 'completada' | 'cancelada' | 'no_asistio';
    motivo?: string;
    sala?: string;
}

export interface DemoExam {
    id: string;
    empresaId: string;
    pacienteId: string;
    medicoId?: string;
    tipoExamen: string;
    fechaProgramada?: string;
    fechaRealizada?: string;
    estado: 'programado' | 'en_proceso' | 'completado' | 'cancelado';
    aptitudMedica: 'apto' | 'apto_con_limitaciones' | 'no_apto' | 'pendiente';
    observaciones?: string;
    resultados?: Record<string, any>;
}

// ============================================
// CONSTANTES
// ============================================

export const DEMO_EMPRESA_ID = '00000000-0000-0000-0000-000000000001';
export const DEMO_SEDE_ID = '10000000-0000-0000-0000-000000000001';

// ============================================
// USUARIOS DEMO
// ============================================

export const DEMO_USERS: DemoUser[] = [
    {
        id: 'user-super-admin',
        email: 'super@gpmedical.mx',
        nombre: 'Administrador',
        apellidoPaterno: 'Sistema',
        apellidoMaterno: 'SaaS',
        hierarchy: 'super_admin',
        empresaId: DEMO_EMPRESA_ID,
        sedeId: DEMO_SEDE_ID,
        telefono: '5500000001',
    },
    {
        id: 'user-admin-empresa',
        email: 'admin@gpmedical.mx',
        nombre: 'Carlos',
        apellidoPaterno: 'Hernández',
        apellidoMaterno: 'López',
        hierarchy: 'admin_empresa',
        empresaId: DEMO_EMPRESA_ID,
        sedeId: DEMO_SEDE_ID,
        telefono: '5500000002',
    },
    {
        id: 'user-medico-trabajo',
        email: 'roberto.mendez@gpmedical.mx',
        nombre: 'Roberto',
        apellidoPaterno: 'Méndez',
        apellidoMaterno: 'Salazar',
        hierarchy: 'medico_trabajo',
        empresaId: DEMO_EMPRESA_ID,
        sedeId: DEMO_SEDE_ID,
        telefono: '5500000003',
        cedulaProfesional: 'CED-12345678',
        especialidad: 'Medicina del Trabajo',
    },
    {
        id: 'user-medico-especialista',
        email: 'maria.garcia@gpmedical.mx',
        nombre: 'María Elena',
        apellidoPaterno: 'García',
        apellidoMaterno: 'Torres',
        hierarchy: 'medico_especialista',
        empresaId: DEMO_EMPRESA_ID,
        sedeId: DEMO_SEDE_ID,
        telefono: '5500000004',
        cedulaProfesional: 'CED-87654321',
        especialidad: 'Audiología',
    },
    {
        id: 'user-enfermera',
        email: 'ana.lopez@gpmedical.mx',
        nombre: 'Ana Sofía',
        apellidoPaterno: 'López',
        apellidoMaterno: 'Rivera',
        hierarchy: 'enfermera',
        empresaId: DEMO_EMPRESA_ID,
        sedeId: DEMO_SEDE_ID,
        telefono: '5500000005',
        cedulaProfesional: 'CED-11111111',
        especialidad: 'Enfermería',
    },
    {
        id: 'user-recepcion',
        email: 'julia.recepcion@gpmedical.mx',
        nombre: 'Julia',
        apellidoPaterno: 'Martínez',
        apellidoMaterno: 'Soto',
        hierarchy: 'recepcion',
        empresaId: DEMO_EMPRESA_ID,
        sedeId: DEMO_SEDE_ID,
        telefono: '5500000006',
    },
    {
        id: 'user-paciente-1',
        email: 'juan.rodriguez@demo.com',
        nombre: 'Juan Carlos',
        apellidoPaterno: 'Rodríguez',
        apellidoMaterno: 'López',
        hierarchy: 'paciente',
        empresaId: DEMO_EMPRESA_ID,
        sedeId: DEMO_SEDE_ID,
        telefono: '5551234567',
    },
    {
        id: 'user-paciente-2',
        email: 'maria.gonzalez@demo.com',
        nombre: 'María Fernanda',
        apellidoPaterno: 'González',
        apellidoMaterno: 'Sánchez',
        hierarchy: 'paciente',
        empresaId: DEMO_EMPRESA_ID,
        sedeId: DEMO_SEDE_ID,
        telefono: '5559876543',
    },
];

// ============================================
// PACIENTES DEMO
// ============================================

export const DEMO_PATIENTS: DemoPatient[] = [
    {
        id: '40000000-0000-0000-0000-000000000001',
        empresaId: DEMO_EMPRESA_ID,
        numeroEmpleado: 'EMP-001',
        nombre: 'Juan Carlos',
        apellidoPaterno: 'Rodríguez',
        apellidoMaterno: 'López',
        fechaNacimiento: '1985-03-15',
        genero: 'masculino',
        email: 'juan.rodriguez@demo.com',
        telefono: '5551234567',
        puestoTrabajoId: '20000000-0000-0000-0000-000000000001',
        estatus: 'activo',
        nss: '12345678901',
        curp: 'ROLJ850315HDFRPN01',
        tipoSangre: 'O+',
        alergias: 'Ninguna conocida',
        usuarioId: 'user-paciente-1', // TIENE CUENTA DE USUARIO
    },
    {
        id: '40000000-0000-0000-0000-000000000002',
        empresaId: DEMO_EMPRESA_ID,
        numeroEmpleado: 'EMP-002',
        nombre: 'María Fernanda',
        apellidoPaterno: 'González',
        apellidoMaterno: 'Sánchez',
        fechaNacimiento: '1990-07-20',
        genero: 'femenino',
        email: 'maria.gonzalez@demo.com',
        telefono: '5559876543',
        puestoTrabajoId: '20000000-0000-0000-0000-000000000002',
        estatus: 'activo',
        nss: '23456789012',
        curp: 'GOSM900720MDFNRR02',
        tipoSangre: 'A+',
        alergias: 'Penicilina',
        usuarioId: 'user-paciente-2', // TIENE CUENTA DE USUARIO
    },
    {
        id: '40000000-0000-0000-0000-000000000003',
        empresaId: DEMO_EMPRESA_ID,
        numeroEmpleado: 'EMP-003',
        nombre: 'Pedro',
        apellidoPaterno: 'Martínez',
        apellidoMaterno: 'Hernández',
        fechaNacimiento: '1988-05-12',
        genero: 'masculino',
        email: 'pedro.martinez@empresa.com',
        telefono: '5552468135',
        puestoTrabajoId: '20000000-0000-0000-0000-000000000003',
        estatus: 'activo',
        nss: '34567890123',
        curp: 'MAHP880512HDFRRP03',
        tipoSangre: 'B+',
    },
    {
        id: '40000000-0000-0000-0000-000000000004',
        empresaId: DEMO_EMPRESA_ID,
        numeroEmpleado: 'EMP-004',
        nombre: 'Ana Laura',
        apellidoPaterno: 'Ramírez',
        apellidoMaterno: 'García',
        fechaNacimiento: '1995-08-30',
        genero: 'femenino',
        email: 'ana.ramirez@empresa.com',
        telefono: '5554567890',
        puestoTrabajoId: '20000000-0000-0000-0000-000000000005',
        estatus: 'activo',
        nss: '45678901234',
        curp: 'RAGA950830MDFMRN04',
        tipoSangre: 'AB+',
        alergias: 'Polen',
    },
    {
        id: '40000000-0000-0000-0000-000000000005',
        empresaId: DEMO_EMPRESA_ID,
        numeroEmpleado: 'EMP-005',
        nombre: 'Roberto',
        apellidoPaterno: 'Sánchez',
        apellidoMaterno: 'Pérez',
        fechaNacimiento: '1982-02-25',
        genero: 'masculino',
        email: 'roberto.sanchez@empresa.com',
        telefono: '5555678901',
        puestoTrabajoId: '20000000-0000-0000-0000-000000000004',
        estatus: 'activo',
        nss: '56789012345',
        curp: 'SAPR820225HDFNRB05',
        tipoSangre: 'O-',
        alergias: 'Sulfas',
    },
    {
        id: '40000000-0000-0000-0000-000000000006',
        empresaId: DEMO_EMPRESA_ID,
        numeroEmpleado: 'EMP-006',
        nombre: 'Carmen',
        apellidoPaterno: 'López',
        apellidoMaterno: 'Torres',
        fechaNacimiento: '1988-06-17',
        genero: 'femenino',
        estatus: 'activo',
        tipoSangre: 'A-',
    },
    {
        id: '40000000-0000-0000-0000-000000000007',
        empresaId: DEMO_EMPRESA_ID,
        numeroEmpleado: 'EMP-007',
        nombre: 'Francisco',
        apellidoPaterno: 'Hernández',
        apellidoMaterno: 'Ruiz',
        fechaNacimiento: '1992-04-10',
        genero: 'masculino',
        estatus: 'activo',
        tipoSangre: 'B-',
        alergias: 'Látex',
    },
    {
        id: '40000000-0000-0000-0000-000000000008',
        empresaId: DEMO_EMPRESA_ID,
        numeroEmpleado: 'EMP-008',
        nombre: 'Gabriela',
        apellidoPaterno: 'Torres',
        apellidoMaterno: 'Mendoza',
        fechaNacimiento: '1989-11-05',
        genero: 'femenino',
        estatus: 'activo',
        tipoSangre: 'O+',
    },
    {
        id: '40000000-0000-0000-0000-000000000009',
        empresaId: DEMO_EMPRESA_ID,
        numeroEmpleado: 'EMP-009',
        nombre: 'Luis Alberto',
        apellidoPaterno: 'Pérez',
        apellidoMaterno: 'Jiménez',
        fechaNacimiento: '1987-07-28',
        genero: 'masculino',
        estatus: 'incapacitado', // INCAPACITADO
        tipoSangre: 'A+',
        alergias: 'Mariscos',
    },
    {
        id: '40000000-0000-0000-0000-000000000010',
        empresaId: DEMO_EMPRESA_ID,
        numeroEmpleado: 'EMP-010',
        nombre: 'Diana',
        apellidoPaterno: 'García',
        apellidoMaterno: 'Flores',
        fechaNacimiento: '1993-03-15',
        genero: 'femenino',
        estatus: 'activo',
        tipoSangre: 'AB-',
    },
];

// ============================================
// PUESTOS DE TRABAJO DEMO
// ============================================

export const DEMO_JOB_POSITIONS = [
    { id: '20000000-0000-0000-0000-000000000001', nombre: 'Operador de Maquinaria Pesada', nivelRiesgo: 'alto' },
    { id: '20000000-0000-0000-0000-000000000002', nombre: 'Supervisor de Obra', nivelRiesgo: 'medio' },
    { id: '20000000-0000-0000-0000-000000000003', nombre: 'Técnico de Producción', nivelRiesgo: 'medio' },
    { id: '20000000-0000-0000-0000-000000000004', nombre: 'Chofer de Tráiler', nivelRiesgo: 'alto' },
    { id: '20000000-0000-0000-0000-000000000005', nombre: 'Administrativo', nivelRiesgo: 'bajo' },
];

// ============================================
// CITAS DEMO (Relativas al día actual)
// ============================================

const today = new Date().toISOString().split('T')[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

export const DEMO_APPOINTMENTS: DemoAppointment[] = [
    {
        id: '50000000-0000-0000-0000-000000000001',
        empresaId: DEMO_EMPRESA_ID,
        pacienteId: '40000000-0000-0000-0000-000000000001',
        medicoId: 'user-medico-trabajo',
        tipoCita: 'examen_ocupacional',
        fecha: today,
        horaInicio: '09:00',
        horaFin: '10:00',
        estado: 'confirmada',
        motivo: 'Examen periódico anual',
        sala: 'Consultorio 1',
    },
    {
        id: '50000000-0000-0000-0000-000000000002',
        empresaId: DEMO_EMPRESA_ID,
        pacienteId: '40000000-0000-0000-0000-000000000002',
        medicoId: 'user-medico-trabajo',
        tipoCita: 'examen_ocupacional',
        fecha: today,
        horaInicio: '10:00',
        horaFin: '11:30',
        estado: 'programada',
        motivo: 'Examen de ingreso completo',
        sala: 'Consultorio 1',
    },
    {
        id: '50000000-0000-0000-0000-000000000003',
        empresaId: DEMO_EMPRESA_ID,
        pacienteId: '40000000-0000-0000-0000-000000000003',
        medicoId: 'user-medico-especialista',
        tipoCita: 'consulta',
        fecha: today,
        horaInicio: '11:30',
        horaFin: '12:00',
        estado: 'en_curso',
        motivo: 'Seguimiento audiometría',
        sala: 'Consultorio 2',
    },
    {
        id: '50000000-0000-0000-0000-000000000004',
        empresaId: DEMO_EMPRESA_ID,
        pacienteId: '40000000-0000-0000-0000-000000000004',
        medicoId: 'user-medico-trabajo',
        tipoCita: 'examen_ocupacional',
        fecha: today,
        horaInicio: '14:00',
        horaFin: '15:00',
        estado: 'programada',
        motivo: 'Examen periódico',
        sala: 'Consultorio 1',
    },
    {
        id: '50000000-0000-0000-0000-000000000005',
        empresaId: DEMO_EMPRESA_ID,
        pacienteId: '40000000-0000-0000-0000-000000000005',
        medicoId: 'user-medico-trabajo',
        tipoCita: 'examen_ocupacional',
        fecha: today,
        horaInicio: '15:30',
        horaFin: '16:30',
        estado: 'programada',
        motivo: 'Examen chofer DOT',
        sala: 'Consultorio 1',
    },
    {
        id: '50000000-0000-0000-0000-000000000006',
        empresaId: DEMO_EMPRESA_ID,
        pacienteId: '40000000-0000-0000-0000-000000000006',
        medicoId: 'user-medico-trabajo',
        tipoCita: 'examen_ocupacional',
        fecha: tomorrow,
        horaInicio: '09:00',
        horaFin: '10:00',
        estado: 'programada',
        motivo: 'Examen periódico',
        sala: 'Consultorio 1',
    },
    {
        id: '50000000-0000-0000-0000-000000000007',
        empresaId: DEMO_EMPRESA_ID,
        pacienteId: '40000000-0000-0000-0000-000000000007',
        medicoId: 'user-medico-trabajo',
        tipoCita: 'examen_ocupacional',
        fecha: tomorrow,
        horaInicio: '10:00',
        horaFin: '11:30',
        estado: 'programada',
        motivo: 'Examen de ingreso',
        sala: 'Consultorio 1',
    },
    {
        id: '50000000-0000-0000-0000-000000000008',
        empresaId: DEMO_EMPRESA_ID,
        pacienteId: '40000000-0000-0000-0000-000000000001',
        medicoId: 'user-medico-especialista',
        tipoCita: 'seguimiento',
        fecha: tomorrow,
        horaInicio: '12:00',
        horaFin: '12:30',
        estado: 'programada',
        motivo: 'Resultados de laboratorio',
        sala: 'Consultorio 2',
    },
];

// ============================================
// EXÁMENES DEMO
// ============================================

export const DEMO_EXAMS: DemoExam[] = [
    {
        id: '60000000-0000-0000-0000-000000000001',
        empresaId: DEMO_EMPRESA_ID,
        pacienteId: '40000000-0000-0000-0000-000000000001',
        medicoId: 'user-medico-trabajo',
        tipoExamen: 'ingreso',
        fechaProgramada: '2023-12-26',
        fechaRealizada: '2023-12-26',
        estado: 'completado',
        aptitudMedica: 'apto',
        observaciones: 'Paciente en excelentes condiciones de salud. Sin restricciones.',
        resultados: {
            presion_arterial: '120/80',
            frecuencia_cardiaca: 72,
            peso_kg: 78,
            talla_cm: 175,
            imc: 25.5,
        },
    },
    {
        id: '60000000-0000-0000-0000-000000000002',
        empresaId: DEMO_EMPRESA_ID,
        pacienteId: '40000000-0000-0000-0000-000000000002',
        medicoId: 'user-medico-trabajo',
        tipoExamen: 'periodico',
        fechaProgramada: '2024-11-26',
        fechaRealizada: '2024-11-26',
        estado: 'completado',
        aptitudMedica: 'apto_con_limitaciones',
        observaciones: 'Alergia a penicilina documentada. Se recomienda evitar exposición a polvo.',
        resultados: {
            presion_arterial: '110/70',
            frecuencia_cardiaca: 68,
            peso_kg: 62,
            talla_cm: 165,
            imc: 22.8,
        },
    },
    {
        id: '60000000-0000-0000-0000-000000000003',
        empresaId: DEMO_EMPRESA_ID,
        pacienteId: '40000000-0000-0000-0000-000000000003',
        medicoId: 'user-medico-trabajo',
        tipoExamen: 'periodico',
        fechaProgramada: today,
        estado: 'programado',
        aptitudMedica: 'pendiente',
    },
    {
        id: '60000000-0000-0000-0000-000000000004',
        empresaId: DEMO_EMPRESA_ID,
        pacienteId: '40000000-0000-0000-0000-000000000004',
        medicoId: 'user-medico-trabajo',
        tipoExamen: 'ingreso',
        fechaProgramada: today,
        fechaRealizada: today,
        estado: 'en_proceso',
        aptitudMedica: 'pendiente',
        observaciones: 'En espera de resultados de laboratorio.',
        resultados: {
            presion_arterial: '125/82',
            frecuencia_cardiaca: 75,
            peso_kg: 58,
            talla_cm: 160,
            imc: 22.6,
        },
    },
];

// ============================================
// ESTADÍSTICAS DEMO PARA DASHBOARD
// ============================================

export const DEMO_DASHBOARD_STATS = {
    totalPacientes: DEMO_PATIENTS.length,
    pacientesActivos: DEMO_PATIENTS.filter(p => p.estatus === 'activo').length,
    pacientesIncapacitados: DEMO_PATIENTS.filter(p => p.estatus === 'incapacitado').length,
    citasHoy: DEMO_APPOINTMENTS.filter(a => a.fecha === today).length,
    citasProgramadas: DEMO_APPOINTMENTS.filter(a => a.estado === 'programada').length,
    citasConfirmadas: DEMO_APPOINTMENTS.filter(a => a.estado === 'confirmada').length,
    citasEnCurso: DEMO_APPOINTMENTS.filter(a => a.estado === 'en_curso').length,
    examenesCompletados: DEMO_EXAMS.filter(e => e.estado === 'completado').length,
    examenesPendientes: DEMO_EXAMS.filter(e => e.estado === 'programado' || e.estado === 'en_proceso').length,
    totalUsuarios: DEMO_USERS.length,
    medicos: DEMO_USERS.filter(u => u.hierarchy.includes('medico')).length,
};

// ============================================
// ALERTAS DEMO
// ============================================

export const DEMO_ALERTS = [
    {
        id: '90000000-0000-0000-0000-000000000001',
        tipoAlerta: 'examen_vencido',
        prioridad: 'alta',
        titulo: 'Exámenes próximos a vencer',
        descripcion: '3 empleados tienen exámenes que vencen esta semana',
        estado: 'activa',
    },
    {
        id: '90000000-0000-0000-0000-000000000002',
        tipoAlerta: 'inventario_bajo',
        prioridad: 'media',
        titulo: 'Inventario bajo: Ibuprofeno',
        descripcion: 'El stock de Ibuprofeno 400mg está por debajo del mínimo',
        estado: 'activa',
    },
    {
        id: '90000000-0000-0000-0000-000000000003',
        tipoAlerta: 'certificado_proximo_vencer',
        prioridad: 'media',
        titulo: 'Certificado próximo a vencer',
        descripcion: 'Juan Carlos Rodríguez - Certificado vence en 5 días',
        estado: 'activa',
    },
    {
        id: '90000000-0000-0000-0000-000000000004',
        tipoAlerta: 'incidencia_alta_riesgo',
        prioridad: 'critica',
        titulo: 'Incapacidad prolongada',
        descripcion: 'Luis Alberto Pérez lleva 10 días de incapacidad',
        estado: 'activa',
    },
];

// ============================================
// HELPERS
// ============================================

/**
 * Obtiene un usuario demo por email
 */
export function getDemoUserByEmail(email: string): DemoUser | undefined {
    return DEMO_USERS.find(u => u.email === email);
}

/**
 * Obtiene un paciente demo por ID
 */
export function getDemoPatientById(id: string): DemoPatient | undefined {
    return DEMO_PATIENTS.find(p => p.id === id);
}

/**
 * Obtiene el paciente vinculado a un usuario (si existe)
 */
export function getDemoPatientForUser(userId: string): DemoPatient | undefined {
    return DEMO_PATIENTS.find(p => p.usuarioId === userId);
}

/**
 * Obtiene las citas de un paciente
 */
export function getDemoAppointmentsForPatient(patientId: string): DemoAppointment[] {
    return DEMO_APPOINTMENTS.filter(a => a.pacienteId === patientId);
}

/**
 * Obtiene las citas de un médico
 */
export function getDemoAppointmentsForDoctor(doctorId: string): DemoAppointment[] {
    return DEMO_APPOINTMENTS.filter(a => a.medicoId === doctorId);
}

/**
 * Obtiene los exámenes de un paciente
 */
export function getDemoExamsForPatient(patientId: string): DemoExam[] {
    return DEMO_EXAMS.filter(e => e.pacienteId === patientId);
}

/**
 * Nombre completo de un paciente
 */
export function getPatientFullName(patient: DemoPatient): string {
    return `${patient.nombre} ${patient.apellidoPaterno} ${patient.apellidoMaterno || ''}`.trim();
}

/**
 * Nombre completo de un usuario
 */
export function getUserFullName(user: DemoUser): string {
    return `${user.nombre} ${user.apellidoPaterno} ${user.apellidoMaterno || ''}`.trim();
}

// ============================================
// FUNCIONES DE FILTRADO POR ROL
// ============================================

/**
 * Obtiene pacientes según el rol del usuario
 * - super_admin/admin_empresa: todos los pacientes
 * - medico: pacientes con citas asignadas a ellos
 * - paciente: solo su propio perfil
 */
export function getDemoDataForRole(userId: string, userRole: string) {
    let patients: DemoPatient[] = [];
    let appointments: DemoAppointment[] = [];
    let exams: DemoExam[] = [];
    let alerts = DEMO_ALERTS;
    let stats = { ...DEMO_DASHBOARD_STATS };

    switch (userRole) {
        case 'super_admin':
            // Ve todo
            patients = DEMO_PATIENTS;
            appointments = DEMO_APPOINTMENTS;
            exams = DEMO_EXAMS;
            break;

        case 'admin_empresa':
            // Ve todos los de su empresa
            patients = DEMO_PATIENTS;
            appointments = DEMO_APPOINTMENTS;
            exams = DEMO_EXAMS;
            break;

        case 'medico':
        case 'medico_trabajo':
        case 'medico_especialista':
            // Ve solo pacientes con citas asignadas a él
            const doctorAppts = DEMO_APPOINTMENTS.filter(a => a.medicoId === userId);
            const patientIds = [...new Set(doctorAppts.map(a => a.pacienteId))];
            patients = DEMO_PATIENTS.filter(p => patientIds.includes(p.id));
            appointments = doctorAppts;
            exams = DEMO_EXAMS.filter(e => e.medicoId === userId || patientIds.includes(e.pacienteId));
            alerts = DEMO_ALERTS.filter(a => a.prioridad === 'critica' || a.prioridad === 'alta');
            stats = {
                ...stats,
                totalPacientes: patients.length,
                citasHoy: appointments.filter(a => a.fecha === new Date().toISOString().split('T')[0]).length,
            };
            break;

        case 'enfermera':
            // Ve pacientes y citas del día
            const today = new Date().toISOString().split('T')[0];
            appointments = DEMO_APPOINTMENTS.filter(a => a.fecha === today);
            const todayPatientIds = [...new Set(appointments.map(a => a.pacienteId))];
            patients = DEMO_PATIENTS.filter(p => todayPatientIds.includes(p.id));
            exams = DEMO_EXAMS.filter(e => e.fechaProgramada === today || e.fechaRealizada === today);
            alerts = [];
            stats = {
                ...stats,
                totalPacientes: patients.length,
                citasHoy: appointments.length,
            };
            break;

        case 'recepcion':
            // Ve citas programadas, pacientes básico
            patients = DEMO_PATIENTS.map(p => ({
                ...p,
                alergias: undefined,
                tipoSangre: undefined,
            }));
            appointments = DEMO_APPOINTMENTS;
            exams = [];
            alerts = [];
            stats = {
                ...stats,
                examenesCompletados: 0,
                examenesPendientes: 0,
            };
            break;

        case 'paciente':
            // Solo su propio perfil
            const myPatient = getDemoPatientForUser(userId);
            patients = myPatient ? [myPatient] : [];
            appointments = myPatient ? getDemoAppointmentsForPatient(myPatient.id) : [];
            exams = myPatient ? getDemoExamsForPatient(myPatient.id) : [];
            alerts = [];
            stats = {
                totalPacientes: 1,
                pacientesActivos: 1,
                pacientesIncapacitados: 0,
                citasHoy: appointments.filter(a => a.fecha === new Date().toISOString().split('T')[0]).length,
                citasProgramadas: appointments.filter(a => a.estado === 'programada').length,
                citasConfirmadas: appointments.filter(a => a.estado === 'confirmada').length,
                citasEnCurso: 0,
                examenesCompletados: exams.filter(e => e.estado === 'completado').length,
                examenesPendientes: exams.filter(e => e.estado === 'programado').length,
                totalUsuarios: 1,
                medicos: 0,
            };
            break;

        default:
            patients = [];
            appointments = [];
            exams = [];
            alerts = [];
    }

    return { patients, appointments, exams, alerts, stats };
}

/**
 * Convierte DemoPatient a formato Paciente del servicio
 */
export function convertToServicePaciente(patient: DemoPatient) {
    return {
        id: patient.id,
        empresa_id: patient.empresaId,
        numero_empleado: patient.numeroEmpleado,
        nombre: patient.nombre,
        apellido_paterno: patient.apellidoPaterno,
        apellido_materno: patient.apellidoMaterno || '',
        fecha_nacimiento: patient.fechaNacimiento,
        genero: patient.genero === 'masculino' ? 'M' : patient.genero === 'femenino' ? 'F' : 'O',
        email: patient.email || '',
        telefono: patient.telefono || '',
        puesto: DEMO_JOB_POSITIONS.find(j => j.id === patient.puestoTrabajoId)?.nombre || '',
        foto_url: '',
        estatus: patient.estatus === 'activo' ? 'apto' : patient.estatus === 'incapacitado' ? 'restriccion' : 'no_apto',
        sede_id: DEMO_SEDE_ID,
        created_at: new Date().toISOString(),
        tipo_sangre: patient.tipoSangre,
        alergias: patient.alergias,
        curp: patient.curp,
        nss: patient.nss,
    };
}

export default {
    DEMO_EMPRESA_ID,
    DEMO_SEDE_ID,
    DEMO_USERS,
    DEMO_PATIENTS,
    DEMO_JOB_POSITIONS,
    DEMO_APPOINTMENTS,
    DEMO_EXAMS,
    DEMO_ALERTS,
    DEMO_DASHBOARD_STATS,
    getDemoUserByEmail,
    getDemoPatientById,
    getDemoPatientForUser,
    getDemoAppointmentsForPatient,
    getDemoAppointmentsForDoctor,
    getDemoExamsForPatient,
    getPatientFullName,
    getUserFullName,
    getDemoDataForRole,
    convertToServicePaciente,
};
