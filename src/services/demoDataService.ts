/**
 * Servicio de Datos para Modo Demo/Offline
 * GPMedical ERP Pro
 * 
 * Este servicio provee datos mock cuando Supabase no está disponible
 * o para demostraciones sin conexión a base de datos.
 */

import {
    EMPRESAS_MOCK,
    SEDES_MOCK,
    USUARIOS_MOCK,
    PACIENTES_MOCK,
    getMockPacientesByEmpresa,
    getMockSedesByEmpresa,
    MockPaciente
} from '@/data/mockData'

// Verificar si estamos en modo demo
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' ||
    !import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.VITE_SUPABASE_URL === 'demo'

console.log(`🔧 GPMedical - Modo: ${DEMO_MODE ? 'DEMO (Datos Mock)' : 'PRODUCCIÓN (Supabase)'}`)

// =====================================================
// SERVICIO DE PACIENTES DEMO
// =====================================================

export const pacientesDemoService = {
    async getAll(empresaId?: string) {
        const pacientes = empresaId
            ? getMockPacientesByEmpresa(empresaId)
            : PACIENTES_MOCK

        return pacientes.map(p => ({
            id: p.id,
            empresa_id: p.empresa_id,
            sede_id: p.sede_id,
            nombre: p.nombre,
            apellido_paterno: p.apellido_paterno,
            apellido_materno: p.apellido_materno,
            curp: p.curp,
            nss: p.nss,
            fecha_nacimiento: p.fecha_nacimiento,
            genero: p.sexo === 'M' ? 'Masculino' : 'Femenino',
            tipo_sangre: p.tipo_sangre,
            alergias: p.alergias,
            puesto: p.puesto_trabajo,
            area: p.departamento,
            departamento: p.departamento,
            telefono: p.telefono,
            email: p.email,
            estatus: p.activo ? 'activo' : 'inactivo',
            created_at: new Date().toISOString(),
            empresa_nombre: EMPRESAS_MOCK.find(e => e.id === p.empresa_id)?.nombre || 'Desconocida',
            sede_nombre: SEDES_MOCK.find(s => s.id === p.sede_id)?.nombre || 'General'
        }))
    },

    async getById(id: string) {
        const p = PACIENTES_MOCK.find(pac => pac.id === id)
        if (!p) throw new Error('Paciente no encontrado')

        return {
            id: p.id,
            empresa_id: p.empresa_id,
            sede_id: p.sede_id,
            nombre: p.nombre,
            apellido_paterno: p.apellido_paterno,
            apellido_materno: p.apellido_materno,
            curp: p.curp,
            nss: p.nss,
            fecha_nacimiento: p.fecha_nacimiento,
            genero: p.sexo === 'M' ? 'Masculino' : 'Femenino',
            tipo_sangre: p.tipo_sangre,
            alergias: p.alergias,
            puesto: p.puesto_trabajo,
            area: p.departamento,
            departamento: p.departamento,
            telefono: p.telefono,
            email: p.email,
            estatus: p.activo ? 'activo' : 'inactivo',
            created_at: new Date().toISOString(),
            empresa_nombre: EMPRESAS_MOCK.find(e => e.id === p.empresa_id)?.nombre || 'Desconocida',
            sede_nombre: SEDES_MOCK.find(s => s.id === p.sede_id)?.nombre || 'General'
        }
    },

    async search(query: string, empresaId?: string) {
        const pacientes = empresaId
            ? getMockPacientesByEmpresa(empresaId)
            : PACIENTES_MOCK

        const q = query.toLowerCase()
        return pacientes
            .filter(p =>
                p.nombre.toLowerCase().includes(q) ||
                p.apellido_paterno.toLowerCase().includes(q) ||
                p.curp.toLowerCase().includes(q) ||
                p.nss.includes(q)
            )
            .slice(0, 20)
    },

    async create(paciente: Partial<MockPaciente>) {
        const newId = `p-${Date.now()}`
        const newPaciente = {
            id: newId,
            ...paciente,
            created_at: new Date().toISOString()
        }
        // En modo demo, solo simulamos la creación
        console.log('📝 [DEMO] Paciente creado:', newPaciente)
        return newPaciente
    },

    async update(id: string, updates: Partial<MockPaciente>) {
        console.log('📝 [DEMO] Paciente actualizado:', id, updates)
        return { id, ...updates }
    },

    async delete(id: string) {
        console.log('🗑️ [DEMO] Paciente eliminado:', id)
        return true
    }
}

// =====================================================
// SERVICIO DE EMPRESAS DEMO
// =====================================================

export const empresasDemoService = {
    async getAll() {
        return EMPRESAS_MOCK.map(e => ({
            id: e.id,
            nombre: e.nombre,
            rfc: e.rfc,
            plan: e.plan,
            activo: e.activo,
            created_at: new Date().toISOString()
        }))
    },

    async getById(id: string) {
        const emp = EMPRESAS_MOCK.find(e => e.id === id)
        if (!emp) throw new Error('Empresa no encontrada')
        return {
            ...emp,
            created_at: new Date().toISOString()
        }
    },

    async create(empresa: any) {
        const newId = `emp-${Date.now()}`
        console.log('📝 [DEMO] Empresa creada:', empresa)
        return { id: newId, ...empresa }
    },

    async update(id: string, updates: any) {
        console.log('📝 [DEMO] Empresa actualizada:', id, updates)
        return { id, ...updates }
    },

    async toggleStatus(id: string, nuevoEstado: boolean) {
        console.log('📝 [DEMO] Estado de empresa cambiado:', id, nuevoEstado)
        return true
    }
}

// =====================================================
// SERVICIO DE SEDES DEMO
// =====================================================

export const sedesDemoService = {
    async getAll(empresaId?: string) {
        const sedes = empresaId
            ? getMockSedesByEmpresa(empresaId)
            : SEDES_MOCK

        return sedes.map(s => ({
            id: s.id,
            empresa_id: s.empresa_id,
            nombre: s.nombre,
            es_sede_principal: s.es_matriz,
            activa: true,
            created_at: new Date().toISOString()
        }))
    },

    async create(sede: any) {
        const newId = `sede-${Date.now()}`
        console.log('📝 [DEMO] Sede creada:', sede)
        return { id: newId, ...sede }
    },

    async update(id: string, updates: any) {
        console.log('📝 [DEMO] Sede actualizada:', id, updates)
        return { id, ...updates }
    },

    async toggleStatus(id: string, activa: boolean) {
        console.log('📝 [DEMO] Estado de sede cambiado:', id, activa)
        return true
    }
}

// =====================================================
// SERVICIO DE CITAS DEMO
// =====================================================

export const citasDemoService = {
    async getByDate(fecha: string, empresaId?: string) {
        // Generar citas de ejemplo para la fecha
        const pacientes = empresaId
            ? getMockPacientesByEmpresa(empresaId)
            : PACIENTES_MOCK

        return pacientes.slice(0, 5).map((p, i) => ({
            id: `cita-${fecha}-${i}`,
            empresa_id: p.empresa_id,
            paciente_id: p.id,
            fecha,
            hora_inicio: `${9 + i}:00`,
            hora_fin: `${9 + i}:30`,
            tipo: i % 2 === 0 ? 'examen_periodico' : 'consulta',
            estado: i === 0 ? 'en_curso' : 'programada',
            notas: '',
            created_at: new Date().toISOString(),
            paciente: {
                id: p.id,
                nombre: p.nombre,
                apellido_paterno: p.apellido_paterno,
                apellido_materno: p.apellido_materno
            }
        }))
    },

    async getByPaciente(pacienteId: string) {
        const today = new Date().toISOString().split('T')[0]
        return [
            {
                id: `cita-${pacienteId}-1`,
                paciente_id: pacienteId,
                fecha: today,
                hora_inicio: '10:00',
                tipo: 'examen_periodico',
                estado: 'programada',
                medico_nombre: 'Dr. Roberto Martínez García'
            }
        ]
    },

    async create(cita: any) {
        const newId = `cita-${Date.now()}`
        console.log('📝 [DEMO] Cita creada:', cita)
        return { id: newId, ...cita }
    },

    async updateStatus(id: string, estado: string) {
        console.log('📝 [DEMO] Estado de cita cambiado:', id, estado)
        return { id, estado }
    },

    async cancel(id: string) {
        return this.updateStatus(id, 'cancelada')
    }
}

// =====================================================
// SERVICIO DE ESTADÍSTICAS DEMO
// =====================================================

export const statsDemoService = {
    async getDashboardStats(empresaId?: string) {
        const pacientes = empresaId
            ? getMockPacientesByEmpresa(empresaId)
            : PACIENTES_MOCK

        return {
            totalPacientes: pacientes.length,
            citasHoy: Math.floor(Math.random() * 10) + 3,
            examenesPendientes: Math.floor(Math.random() * 5) + 1
        }
    }
}

// =====================================================
// DEMO DATA SERVICE EXPORTADO
// =====================================================

export const demoDataService = {
    pacientes: pacientesDemoService,
    empresas: empresasDemoService,
    sedes: sedesDemoService,
    citas: citasDemoService,
    stats: statsDemoService,

    // Flag para verificar modo demo
    isDemoMode: DEMO_MODE
}

export default demoDataService
