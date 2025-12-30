// Datos demo simples para vistas por rol
export type DemoCita = {
  id: string
  paciente: string
  medico: string
  fecha: string // ISO
  hora: string
  motivo: string
  estado: 'programada' | 'completada' | 'cancelada'
}

export const citasPacienteDemo: DemoCita[] = [
  { id: 'c1', paciente: 'María López', medico: 'Dr. Roberto Pérez', fecha: new Date().toISOString(), hora: '10:30', motivo: 'Examen periódico', estado: 'programada' },
  { id: 'c2', paciente: 'María López', medico: 'Dra. Sofía Hernández', fecha: new Date(Date.now() + 86400000).toISOString(), hora: '15:00', motivo: 'Resultados de laboratorio', estado: 'programada' }
]

export const citasMedicoHoyDemo: DemoCita[] = [
  { id: 'm1', paciente: 'Juan Pérez', medico: 'Dr. Roberto Pérez', fecha: new Date().toISOString(), hora: '09:00', motivo: 'Consulta general', estado: 'programada' },
  { id: 'm2', paciente: 'Ana Gómez', medico: 'Dr. Roberto Pérez', fecha: new Date().toISOString(), hora: '10:30', motivo: 'Audiometría', estado: 'programada' },
  { id: 'm3', paciente: 'Carlos Ruiz', medico: 'Dr. Roberto Pérez', fecha: new Date().toISOString(), hora: '12:00', motivo: 'Seguimiento', estado: 'programada' }
]

export const kpisFinancierosDemo = {
  ingresosMes: 142750,
  gastosMes: 45200,
  utilidad: 97550
}
