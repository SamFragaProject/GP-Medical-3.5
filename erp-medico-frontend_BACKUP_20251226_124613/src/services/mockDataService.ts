import { UserRole } from '@/types/auth'

// Tipos de datos (alineados con lo que usan los componentes)
export interface Paciente {
  id: string
  numero_empleado: string
  nombre: string
  apellido_paterno: string
  apellido_materno: string
  genero: string
  fecha_nacimiento: string
  email?: string
  telefono?: string
  fecha_ingreso?: string
  estatus: string
  foto_url?: string
  puesto_trabajo?: {
    nombre: string
    departamento: string
  }
  proximos_examenes?: number
  alertas_activas?: number
  empresa_id: string // Para RLS
  user_id?: string // Para vincular con cuenta de paciente
}

export interface Cita {
  id: string
  paciente_id: string
  medico_id: string
  fechaHora: string
  duracion: number // minutos
  tipo: string
  estado: 'programada' | 'confirmada' | 'completada' | 'cancelada' | 'no_asistio'
  motivo: string
  notas?: string
  empresa_id: string
}

export interface Receta {
  id: string
  paciente_id: string
  medico_id: string
  fecha: string
  medicamentos: any[]
  diagnostico: string
  empresa_id: string
}

// Datos Demo Iniciales
const DEMO_PACIENTES: Paciente[] = [
  {
    id: '1',
    numero_empleado: 'EMP001',
    nombre: 'Juan Carlos',
    apellido_paterno: 'García',
    apellido_materno: 'López',
    genero: 'masculino',
    fecha_nacimiento: '1985-03-15',
    email: 'juan.garcia@empresa.mx',
    telefono: '555-0123',
    fecha_ingreso: '2020-01-15',
    estatus: 'activo',
    puesto_trabajo: {
      nombre: 'Operario de Producción',
      departamento: 'Producción'
    },
    proximos_examenes: 2,
    alertas_activas: 1,
    empresa_id: 'empresa-demo-1',
    user_id: 'user-paciente-1'
  },
  {
    id: '2',
    numero_empleado: 'EMP002',
    nombre: 'María Elena',
    apellido_paterno: 'Rodríguez',
    apellido_materno: 'Martínez',
    genero: 'femenino',
    fecha_nacimiento: '1990-07-22',
    email: 'maria.rodriguez@empresa.mx',
    telefono: '555-0124',
    fecha_ingreso: '2019-03-10',
    estatus: 'activo',
    puesto_trabajo: {
      nombre: 'Asistente Administrativa',
      departamento: 'Administración'
    },
    proximos_examenes: 0,
    alertas_activas: 0,
    empresa_id: 'empresa-demo-1',
    user_id: 'user-paciente-2'
  }
]

const DEMO_CITAS: Cita[] = [
  {
    id: 'cita-1',
    paciente_id: '1',
    medico_id: 'medico-demo-1',
    fechaHora: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(), // Hoy a las 9 AM
    duracion: 30,
    tipo: 'consulta_general',
    estado: 'programada',
    motivo: 'Revisión anual',
    empresa_id: 'empresa-demo-1'
  },
  {
    id: 'cita-2',
    paciente_id: '2',
    medico_id: 'medico-demo-1',
    fechaHora: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(), // Hoy a las 11 AM
    duracion: 45,
    tipo: 'examen_medico',
    estado: 'completada',
    motivo: 'Examen de ingreso',
    empresa_id: 'empresa-demo-1'
  }
]

// Clase de Servicio Mock
class MockDataService {
  private latency = 800 // ms de latencia simulada

  constructor() {
    this.initializeData()
  }

  private initializeData() {
    if (!localStorage.getItem('mock_pacientes')) {
      localStorage.setItem('mock_pacientes', JSON.stringify(DEMO_PACIENTES))
    }
    if (!localStorage.getItem('mock_citas')) {
      localStorage.setItem('mock_citas', JSON.stringify(DEMO_CITAS))
    }
    if (!localStorage.getItem('mock_recetas')) {
      localStorage.setItem('mock_recetas', JSON.stringify([]))
    }
  }

  private async delay() {
    return new Promise(resolve => setTimeout(resolve, this.latency))
  }

  private getCollection<T>(key: string): T[] {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  }

  private setCollection<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data))
  }

  // --- PACIENTES ---

  async getPacientes(currentUser: { role: UserRole, id: string, empresa_id?: string }): Promise<Paciente[]> {
    await this.delay()
    const todos = this.getCollection<Paciente>('mock_pacientes')

    // SIMULACIÓN RLS
    if (currentUser.role === 'super_admin') return todos
    
    if (currentUser.role === 'admin_empresa' || currentUser.role === 'medico') {
      return todos.filter(p => p.empresa_id === currentUser.empresa_id || !p.empresa_id) // !p.empresa_id para legacy
    }

    if (currentUser.role === 'paciente') {
      // El paciente solo se ve a sí mismo
      // Asumimos que el ID del usuario coincide con user_id del paciente o hacemos match por email
      return todos.filter(p => p.user_id === currentUser.id)
    }

    return []
  }

  async createPaciente(paciente: Omit<Paciente, 'id'>): Promise<Paciente> {
    await this.delay()
    const todos = this.getCollection<Paciente>('mock_pacientes')
    const nuevo: Paciente = {
      ...paciente,
      id: Math.random().toString(36).substr(2, 9),
      empresa_id: paciente.empresa_id || 'empresa-demo-1' // Default para demo
    }
    todos.push(nuevo)
    this.setCollection('mock_pacientes', todos)
    return nuevo
  }

  async updatePaciente(id: string, updates: Partial<Paciente>): Promise<Paciente> {
    await this.delay()
    const todos = this.getCollection<Paciente>('mock_pacientes')
    const index = todos.findIndex(p => p.id === id)
    if (index === -1) throw new Error('Paciente no encontrado')
    
    todos[index] = { ...todos[index], ...updates }
    this.setCollection('mock_pacientes', todos)
    return todos[index]
  }

  async deletePaciente(id: string): Promise<void> {
    await this.delay()
    let todos = this.getCollection<Paciente>('mock_pacientes')
    todos = todos.filter(p => p.id !== id)
    this.setCollection('mock_pacientes', todos)
  }

  // --- CITAS ---

  async getCitas(currentUser: { role: UserRole, id: string, empresa_id?: string }): Promise<Cita[]> {
    await this.delay()
    const todas = this.getCollection<Cita>('mock_citas')

    // SIMULACIÓN RLS
    if (currentUser.role === 'super_admin') return todas

    if (currentUser.role === 'admin_empresa') {
      return todas.filter(c => c.empresa_id === currentUser.empresa_id)
    }

    if (currentUser.role === 'medico') {
      // Médico ve citas de su empresa (o solo las suyas, según regla de negocio)
      // Aquí simulamos que ve las de su empresa para evitar conflictos
      return todas.filter(c => c.empresa_id === currentUser.empresa_id)
    }

    if (currentUser.role === 'paciente') {
      // Paciente solo ve sus propias citas
      return todas.filter(c => c.paciente_id === currentUser.id || c.paciente_id === '1') // Hack para demo: user 1 ve citas de paciente 1
    }

    return []
  }

  async createCita(cita: Omit<Cita, 'id'>): Promise<Cita> {
    await this.delay()
    const todas = this.getCollection<Cita>('mock_citas')
    const nueva: Cita = {
      ...cita,
      id: Math.random().toString(36).substr(2, 9)
    }
    todas.push(nueva)
    this.setCollection('mock_citas', todas)
    return nueva
  }

  async updateCita(id: string, updates: Partial<Cita>): Promise<Cita> {
    await this.delay()
    const todas = this.getCollection<Cita>('mock_citas')
    const index = todas.findIndex(c => c.id === id)
    if (index === -1) throw new Error('Cita no encontrada')
    
    todas[index] = { ...todas[index], ...updates }
    this.setCollection('mock_citas', todas)
    return todas[index]
  }
}

export const mockDataService = new MockDataService()
