// Tipos para vistas por rol — sin datos demo
export type DemoCita = {
  id: string
  paciente: string
  medico: string
  fecha: string // ISO
  hora: string
  motivo: string
  estado: 'programada' | 'completada' | 'cancelada'
}

// Arrays vacíos — los datos reales se obtienen de Supabase
export const citasPacienteDemo: DemoCita[] = []
export const citasMedicoHoyDemo: DemoCita[] = []

export const kpisFinancierosDemo = {
  ingresosMes: 0,
  gastosMes: 0,
  utilidad: 0
}
