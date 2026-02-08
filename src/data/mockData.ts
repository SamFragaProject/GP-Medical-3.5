/**
 * Datos Mock para Modo Offline/Demo
 * GPMedical ERP Pro
 * 
 * Estos datos se usan cuando no hay conexión a Supabase
 * o para desarrollo local sin base de datos.
 */

import { User, UserRole } from '@/types/auth'

// =====================================================
// EMPRESAS MOCK
// =====================================================

export const EMPRESAS_MOCK = [
    {
        id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        nombre: 'MediWork Ocupacional',
        rfc: 'MWO2020010ABC',
        plan: 'profesional',
        activo: true
    },
    {
        id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
        nombre: 'Salud Industrial MX',
        rfc: 'SIM2019050XYZ',
        plan: 'enterprise',
        activo: true
    },
    {
        id: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
        nombre: 'Clínica Demo GPMedical',
        rfc: 'CDG2026020DEF',
        plan: 'trial',
        activo: true
    }
]

// =====================================================
// SEDES MOCK
// =====================================================

export const SEDES_MOCK = [
    // MediWork
    { id: 's1a1b1c1-1111-1111-1111-111111111111', empresa_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', nombre: 'Matriz CDMX', es_matriz: true },
    { id: 's1a1b1c1-2222-2222-2222-222222222222', empresa_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', nombre: 'Sucursal Monterrey', es_matriz: false },
    { id: 's1a1b1c1-3333-3333-3333-333333333333', empresa_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', nombre: 'Sucursal Guadalajara', es_matriz: false },
    // Salud Industrial
    { id: 's2a2b2c2-1111-1111-1111-111111111111', empresa_id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012', nombre: 'Planta Norte', es_matriz: true },
    { id: 's2a2b2c2-2222-2222-2222-222222222222', empresa_id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012', nombre: 'Planta Toluca', es_matriz: false },
    // Demo
    { id: 's3a3b3c3-1111-1111-1111-111111111111', empresa_id: 'c3d4e5f6-a7b8-9012-cdef-345678901234', nombre: 'Consultorio Principal', es_matriz: true }
]

// =====================================================
// USUARIOS MOCK
// =====================================================

export interface MockUser {
    id: string
    email: string
    nombre: string
    apellido_paterno: string
    apellido_materno?: string
    rol: UserRole
    empresa_id: string | null
    sede_id: string | null
    cedula_profesional?: string | null
    avatar_url?: string | null
    password: string
}

export const USUARIOS_MOCK: MockUser[] = [
    // Super Admin (Plataforma)
    {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'superadmin@gpmedical.mx',
        nombre: 'Super Admin',
        apellido_paterno: 'GPMedical',
        apellido_materno: '',
        rol: 'super_admin',
        empresa_id: null,
        sede_id: null,
        cedula_profesional: null,
        avatar_url: null,
        password: 'admin123'
    },

    // ====== USUARIOS MEDIWORK ======
    {
        id: 'u1a1b1c1-0001-0001-0001-000000000001',
        email: 'admin@mediwork.mx',
        nombre: 'Carlos',
        apellido_paterno: 'Hernández',
        apellido_materno: 'López',
        rol: 'admin_empresa',
        empresa_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        sede_id: 's1a1b1c1-1111-1111-1111-111111111111',
        cedula_profesional: null,
        avatar_url: null,
        password: 'admin123'
    },
    {
        id: 'u1a1b1c1-0002-0002-0002-000000000002',
        email: 'dr.martinez@mediwork.mx',
        nombre: 'Roberto',
        apellido_paterno: 'Martínez',
        apellido_materno: 'García',
        rol: 'medico',
        empresa_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        sede_id: 's1a1b1c1-1111-1111-1111-111111111111',
        cedula_profesional: '12345678',
        avatar_url: null,
        password: 'medico123'
    },
    {
        id: 'u1a1b1c1-0003-0003-0003-000000000003',
        email: 'dra.gonzalez@mediwork.mx',
        nombre: 'María Elena',
        apellido_paterno: 'González',
        apellido_materno: 'Ramírez',
        rol: 'medico',
        empresa_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        sede_id: 's1a1b1c1-2222-2222-2222-222222222222',
        cedula_profesional: '87654321',
        avatar_url: null,
        password: 'medico123'
    },
    {
        id: 'u1a1b1c1-0004-0004-0004-000000000004',
        email: 'enf.lopez@mediwork.mx',
        nombre: 'Ana Laura',
        apellido_paterno: 'López',
        apellido_materno: 'Sánchez',
        rol: 'enfermera',
        empresa_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        sede_id: 's1a1b1c1-1111-1111-1111-111111111111',
        cedula_profesional: 'ENF-123456',
        avatar_url: null,
        password: 'enfermera123'
    },
    {
        id: 'u1a1b1c1-0005-0005-0005-000000000005',
        email: 'recepcion@mediwork.mx',
        nombre: 'Patricia',
        apellido_paterno: 'Torres',
        apellido_materno: 'Mendoza',
        rol: 'recepcion',
        empresa_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        sede_id: 's1a1b1c1-1111-1111-1111-111111111111',
        cedula_profesional: null,
        avatar_url: null,
        password: 'recepcion123'
    },

    // ====== USUARIOS SALUD INDUSTRIAL ======
    {
        id: 'u2a2b2c2-0001-0001-0001-000000000001',
        email: 'admin@saludindustrial.mx',
        nombre: 'Fernando',
        apellido_paterno: 'Rodríguez',
        apellido_materno: 'Vega',
        rol: 'admin_empresa',
        empresa_id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
        sede_id: 's2a2b2c2-1111-1111-1111-111111111111',
        cedula_profesional: null,
        avatar_url: null,
        password: 'admin123'
    },

    // ====== USUARIOS DEMO ======
    {
        id: 'u3a3b3c3-0001-0001-0001-000000000001',
        email: 'demo@gpmedical.mx',
        nombre: 'Usuario',
        apellido_paterno: 'Demo',
        apellido_materno: 'GPMedical',
        rol: 'admin_empresa',
        empresa_id: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
        sede_id: 's3a3b3c3-1111-1111-1111-111111111111',
        cedula_profesional: null,
        avatar_url: null,
        password: 'demo123'
    },
    {
        id: 'u3a3b3c3-0002-0002-0002-000000000002',
        email: 'doctor.demo@gpmedical.mx',
        nombre: 'Dr. Juan',
        apellido_paterno: 'Pérez',
        apellido_materno: 'Demo',
        rol: 'medico',
        empresa_id: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
        sede_id: 's3a3b3c3-1111-1111-1111-111111111111',
        cedula_profesional: 'DEMO-12345',
        avatar_url: null,
        password: 'doctor123'
    }
]

// =====================================================
// PACIENTES MOCK
// =====================================================

export interface MockPaciente {
    id: string
    empresa_id: string
    sede_id: string
    nombre: string
    apellido_paterno: string
    apellido_materno: string
    fecha_nacimiento: string
    sexo: 'M' | 'F'
    curp: string
    nss: string
    email: string
    telefono: string
    tipo_sangre: string
    alergias: string
    puesto_trabajo: string
    departamento: string
    activo: boolean
}

export const PACIENTES_MOCK: MockPaciente[] = [
    // MediWork Pacientes
    {
        id: 'p1a1b1c1-0001-0001-0001-000000000001',
        empresa_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        sede_id: 's1a1b1c1-1111-1111-1111-111111111111',
        nombre: 'José Luis',
        apellido_paterno: 'García',
        apellido_materno: 'Hernández',
        fecha_nacimiento: '1985-03-15',
        sexo: 'M',
        curp: 'GAHJ850315HDFRRR01',
        nss: '12345678901',
        email: 'jose.garcia@empresa.com',
        telefono: '55 1111 0001',
        tipo_sangre: 'O+',
        alergias: 'Ninguna conocida',
        puesto_trabajo: 'Operador de Montacargas',
        departamento: 'Almacén',
        activo: true
    },
    {
        id: 'p1a1b1c1-0002-0002-0002-000000000002',
        empresa_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        sede_id: 's1a1b1c1-1111-1111-1111-111111111111',
        nombre: 'María Fernanda',
        apellido_paterno: 'Rodríguez',
        apellido_materno: 'López',
        fecha_nacimiento: '1990-07-22',
        sexo: 'F',
        curp: 'ROLF900722MDFDRR02',
        nss: '23456789012',
        email: 'maria.rodriguez@empresa.com',
        telefono: '55 1111 0002',
        tipo_sangre: 'A+',
        alergias: 'Penicilina',
        puesto_trabajo: 'Supervisora de Producción',
        departamento: 'Producción',
        activo: true
    },
    {
        id: 'p1a1b1c1-0003-0003-0003-000000000003',
        empresa_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        sede_id: 's1a1b1c1-1111-1111-1111-111111111111',
        nombre: 'Carlos Alberto',
        apellido_paterno: 'Martínez',
        apellido_materno: 'Sánchez',
        fecha_nacimiento: '1978-11-08',
        sexo: 'M',
        curp: 'MASC781108HDFRRR03',
        nss: '34567890123',
        email: 'carlos.martinez@empresa.com',
        telefono: '55 1111 0003',
        tipo_sangre: 'B+',
        alergias: 'Sulfas',
        puesto_trabajo: 'Técnico de Mantenimiento',
        departamento: 'Mantenimiento',
        activo: true
    },
    {
        id: 'p1a1b1c1-0004-0004-0004-000000000004',
        empresa_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        sede_id: 's1a1b1c1-1111-1111-1111-111111111111',
        nombre: 'Ana Patricia',
        apellido_paterno: 'González',
        apellido_materno: 'Torres',
        fecha_nacimiento: '1995-02-28',
        sexo: 'F',
        curp: 'GOTA950228MDFNRR04',
        nss: '45678901234',
        email: 'ana.gonzalez@empresa.com',
        telefono: '55 1111 0004',
        tipo_sangre: 'O-',
        alergias: 'Látex',
        puesto_trabajo: 'Analista de Calidad',
        departamento: 'Control de Calidad',
        activo: true
    },
    {
        id: 'p1a1b1c1-0005-0005-0005-000000000005',
        empresa_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        sede_id: 's1a1b1c1-1111-1111-1111-111111111111',
        nombre: 'Roberto',
        apellido_paterno: 'Hernández',
        apellido_materno: 'Ramírez',
        fecha_nacimiento: '1982-06-10',
        sexo: 'M',
        curp: 'HERR820610HDFRNR05',
        nss: '56789012345',
        email: 'roberto.hernandez@empresa.com',
        telefono: '55 1111 0005',
        tipo_sangre: 'AB+',
        alergias: 'Ninguna',
        puesto_trabajo: 'Gerente de Operaciones',
        departamento: 'Operaciones',
        activo: true
    },
    // Monterrey
    {
        id: 'p1a1b1c1-0006-0006-0006-000000000006',
        empresa_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        sede_id: 's1a1b1c1-2222-2222-2222-222222222222',
        nombre: 'Laura Beatriz',
        apellido_paterno: 'Vega',
        apellido_materno: 'Morales',
        fecha_nacimiento: '1988-09-05',
        sexo: 'F',
        curp: 'VEML880905MNLGRR06',
        nss: '67890123456',
        email: 'laura.vega@empresa.com',
        telefono: '81 8181 0006',
        tipo_sangre: 'A-',
        alergias: 'Mariscos',
        puesto_trabajo: 'Coordinadora de RRHH',
        departamento: 'Recursos Humanos',
        activo: true
    },
    {
        id: 'p1a1b1c1-0007-0007-0007-000000000007',
        empresa_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        sede_id: 's1a1b1c1-2222-2222-2222-222222222222',
        nombre: 'Miguel Ángel',
        apellido_paterno: 'Flores',
        apellido_materno: 'Díaz',
        fecha_nacimiento: '1975-12-20',
        sexo: 'M',
        curp: 'FODM751220HNLLZR07',
        nss: '78901234567',
        email: 'miguel.flores@empresa.com',
        telefono: '81 8181 0007',
        tipo_sangre: 'B-',
        alergias: 'Aspirina',
        puesto_trabajo: 'Director de Planta',
        departamento: 'Dirección',
        activo: true
    },
    // Guadalajara
    {
        id: 'p1a1b1c1-0008-0008-0008-000000000008',
        empresa_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        sede_id: 's1a1b1c1-3333-3333-3333-333333333333',
        nombre: 'Sandra Patricia',
        apellido_paterno: 'Luna',
        apellido_materno: 'Espinoza',
        fecha_nacimiento: '1992-04-17',
        sexo: 'F',
        curp: 'LUES920417MJCNSR08',
        nss: '89012345678',
        email: 'sandra.luna@empresa.com',
        telefono: '33 3333 0008',
        tipo_sangre: 'O+',
        alergias: 'Ninguna',
        puesto_trabajo: 'Ingeniera de Seguridad',
        departamento: 'Seguridad e Higiene',
        activo: true
    },
    // Más pacientes CDMX
    {
        id: 'p1a1b1c1-0009-0009-0009-000000000009',
        empresa_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        sede_id: 's1a1b1c1-1111-1111-1111-111111111111',
        nombre: 'Francisco Javier',
        apellido_paterno: 'Reyes',
        apellido_materno: 'Castro',
        fecha_nacimiento: '1980-08-25',
        sexo: 'M',
        curp: 'RECF800825HDFSYR09',
        nss: '90123456789',
        email: 'francisco.reyes@empresa.com',
        telefono: '55 1111 0009',
        tipo_sangre: 'A+',
        alergias: 'Ninguna',
        puesto_trabajo: 'Soldador Industrial',
        departamento: 'Producción',
        activo: true
    },
    {
        id: 'p1a1b1c1-0010-0010-0010-000000000010',
        empresa_id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
        sede_id: 's1a1b1c1-1111-1111-1111-111111111111',
        nombre: 'Gabriela',
        apellido_paterno: 'Mendoza',
        apellido_materno: 'Vargas',
        fecha_nacimiento: '1987-01-30',
        sexo: 'F',
        curp: 'MEVG870130MDFNRR10',
        nss: '01234567890',
        email: 'gabriela.mendoza@empresa.com',
        telefono: '55 1111 0010',
        tipo_sangre: 'B+',
        alergias: 'Ibuprofeno',
        puesto_trabajo: 'Contadora',
        departamento: 'Finanzas',
        activo: true
    },

    // Pacientes Salud Industrial
    {
        id: 'p2a2b2c2-0001-0001-0001-000000000001',
        empresa_id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
        sede_id: 's2a2b2c2-1111-1111-1111-111111111111',
        nombre: 'Pedro Pablo',
        apellido_paterno: 'Sánchez',
        apellido_materno: 'Ortega',
        fecha_nacimiento: '1983-05-12',
        sexo: 'M',
        curp: 'SAOP830512HDFNTR11',
        nss: '11122233344',
        email: 'pedro.sanchez@industrial.com',
        telefono: '55 2222 0001',
        tipo_sangre: 'O+',
        alergias: 'Ninguna',
        puesto_trabajo: 'Operador de Maquinaria',
        departamento: 'Producción',
        activo: true
    },
    {
        id: 'p2a2b2c2-0002-0002-0002-000000000002',
        empresa_id: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
        sede_id: 's2a2b2c2-1111-1111-1111-111111111111',
        nombre: 'Elena',
        apellido_paterno: 'Ortiz',
        apellido_materno: 'Jiménez',
        fecha_nacimiento: '1991-10-03',
        sexo: 'F',
        curp: 'OIJE911003MDFRRR12',
        nss: '22233344455',
        email: 'elena.ortiz@industrial.com',
        telefono: '55 2222 0002',
        tipo_sangre: 'A+',
        alergias: 'Polvo',
        puesto_trabajo: 'Supervisora de Línea',
        departamento: 'Producción',
        activo: true
    },

    // Demo pacientes
    {
        id: 'p3a3b3c3-0001-0001-0001-000000000001',
        empresa_id: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
        sede_id: 's3a3b3c3-1111-1111-1111-111111111111',
        nombre: 'Paciente',
        apellido_paterno: 'Prueba',
        apellido_materno: 'Uno',
        fecha_nacimiento: '1990-01-15',
        sexo: 'M',
        curp: 'PUUP900115HDFRRR16',
        nss: '66677788899',
        email: 'paciente1@demo.com',
        telefono: '55 9999 0001',
        tipo_sangre: 'O+',
        alergias: 'Ninguna',
        puesto_trabajo: 'Empleado Demo',
        departamento: 'Demo',
        activo: true
    },
    {
        id: 'p3a3b3c3-0002-0002-0002-000000000002',
        empresa_id: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
        sede_id: 's3a3b3c3-1111-1111-1111-111111111111',
        nombre: 'Trabajadora',
        apellido_paterno: 'Demo',
        apellido_materno: 'Dos',
        fecha_nacimiento: '1988-05-20',
        sexo: 'F',
        curp: 'DEMD880520MDFMRR17',
        nss: '77788899900',
        email: 'paciente2@demo.com',
        telefono: '55 9999 0002',
        tipo_sangre: 'A-',
        alergias: 'Aspirina',
        puesto_trabajo: 'Empleada Demo',
        departamento: 'Demo',
        activo: true
    },
    {
        id: 'p3a3b3c3-0003-0003-0003-000000000003',
        empresa_id: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
        sede_id: 's3a3b3c3-1111-1111-1111-111111111111',
        nombre: 'Usuario',
        apellido_paterno: 'Ejemplo',
        apellido_materno: 'Tres',
        fecha_nacimiento: '1995-09-10',
        sexo: 'M',
        curp: 'EJUT950910HDFJML18',
        nss: '88899900011',
        email: 'paciente3@demo.com',
        telefono: '55 9999 0003',
        tipo_sangre: 'B+',
        alergias: 'Ninguna',
        puesto_trabajo: 'Obrero Demo',
        departamento: 'Demo',
        activo: true
    }
]

// =====================================================
// FUNCIONES HELPER
// =====================================================

/**
 * Busca un usuario mock por email y password
 */
export function findMockUser(email: string, password: string): MockUser | null {
    const user = USUARIOS_MOCK.find(
        u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    return user || null
}

/**
 * Convierte un MockUser a User (para el contexto de autenticación)
 */
export function mockUserToUser(mockUser: MockUser): User {
    const empresa = mockUser.empresa_id
        ? EMPRESAS_MOCK.find(e => e.id === mockUser.empresa_id)
        : null
    const sede = mockUser.sede_id
        ? SEDES_MOCK.find(s => s.id === mockUser.sede_id)
        : null

    return {
        id: mockUser.id,
        email: mockUser.email,
        nombre: mockUser.nombre,
        apellido_paterno: mockUser.apellido_paterno,
        apellido_materno: mockUser.apellido_materno,
        rol: mockUser.rol,
        cedula_profesional: mockUser.cedula_profesional,
        avatar_url: mockUser.avatar_url,
        empresa_id: mockUser.empresa_id || undefined,
        empresa: empresa?.nombre,
        sede_id: mockUser.sede_id || undefined
    }
}

/**
 * Obtiene pacientes por empresa
 */
export function getMockPacientesByEmpresa(empresaId: string): MockPaciente[] {
    return PACIENTES_MOCK.filter(p => p.empresa_id === empresaId)
}

/**
 * Obtiene pacientes por sede
 */
export function getMockPacientesBySede(sedeId: string): MockPaciente[] {
    return PACIENTES_MOCK.filter(p => p.sede_id === sedeId)
}

/**
 * Obtiene sedes por empresa
 */
export function getMockSedesByEmpresa(empresaId: string) {
    return SEDES_MOCK.filter(s => s.empresa_id === empresaId)
}
