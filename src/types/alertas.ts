// Tipos para Alertas de Seguimiento Médico
export interface AlertaSeguimiento {
  id: string
  tipo_alerta: 'examen_vencido' | 'proximo_examen' | 'seguimiento_requerido' | 'certificado_vencido' | 'incapacidad_activa' | 'medicamento_vencido'
  titulo: string
  descripcion: string
  paciente_id: string
  paciente_nombre: string
  numero_empleado: string
  fecha_vencimiento?: string
  fecha_programada?: string
  prioridad: 'alta' | 'media' | 'baja'
  estado: 'activa' | 'resuelta' | 'postponed'
  dias_restantes?: number
  accion_requerida: string
  relacionado_id?: string
  fecha_creacion: string
}

export interface AlertasSeguimientoProps {
  alertas: AlertaSeguimiento[]
  onResolve?: (alertaId: string) => void
  onPostpone?: (alertaId: string, nuevaFecha: string) => void
  onView?: (alerta: AlertaSeguimiento) => void
}

export interface EstadisticasAlertas {
  totalActivas: number
  prioridadAlta: number
  vencidas: number
  estaSemana: number
}

export interface FiltrosAlertas {
  prioridad?: 'alta' | 'media' | 'baja'
  estado?: 'activa' | 'resuelta' | 'postponed' | 'todas'
  tipo?: 'examen_vencido' | 'proximo_examen' | 'seguimiento_requerido' | 'certificado_vencido' | 'incapacidad_activa' | 'medicamento_vencido' | 'todos'
  busqueda?: string
}
