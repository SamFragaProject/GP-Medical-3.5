/**
 * MediFlow ERP - State Machines
 * Defines valid states and transitions for core entities
 * Based on GPT ERP Architecture Recommendations
 */

// ============================================================
// TYPES
// ============================================================

export interface StateDefinition<S extends string> {
    /** Estados a los que puede transicionar desde este estado */
    next: S[]
    /** Es un estado terminal (no puede transicionar a nada) */
    terminal?: boolean
    /** Color para UI */
    color: 'gray' | 'blue' | 'yellow' | 'green' | 'red' | 'purple' | 'orange'
    /** Etiqueta para mostrar en UI */
    label: string
    /** Icono sugerido (lucide-react) */
    icon: string
}

export type StateMachine<S extends string> = Record<S, StateDefinition<S>>

// ============================================================
// CITAS - 9 Estados
// ============================================================

export type CitaStatus =
    | 'BORRADOR'
    | 'CONFIRMADA'
    | 'RECORDATORIO_ENVIADO'
    | 'CHECK_IN'
    | 'EN_CONSULTA'
    | 'CERRADA'
    | 'FACTURADA'
    | 'PAGADA'
    | 'CANCELADA'
    | 'NO_SHOW'

export const CITA_STATE_MACHINE: StateMachine<CitaStatus> = {
    BORRADOR: {
        next: ['CONFIRMADA', 'CANCELADA'],
        color: 'gray',
        label: 'Borrador',
        icon: 'FileEdit'
    },
    CONFIRMADA: {
        next: ['RECORDATORIO_ENVIADO', 'CHECK_IN', 'CANCELADA', 'NO_SHOW'],
        color: 'blue',
        label: 'Confirmada',
        icon: 'CheckCircle'
    },
    RECORDATORIO_ENVIADO: {
        next: ['CHECK_IN', 'CANCELADA', 'NO_SHOW'],
        color: 'purple',
        label: 'Recordatorio Enviado',
        icon: 'Bell'
    },
    CHECK_IN: {
        next: ['EN_CONSULTA', 'CANCELADA'],
        color: 'yellow',
        label: 'Check-in',
        icon: 'UserCheck'
    },
    EN_CONSULTA: {
        next: ['CERRADA'],
        color: 'orange',
        label: 'En Consulta',
        icon: 'Stethoscope'
    },
    CERRADA: {
        next: ['FACTURADA'],
        color: 'green',
        label: 'Cerrada',
        icon: 'ClipboardCheck'
    },
    FACTURADA: {
        next: ['PAGADA'],
        color: 'blue',
        label: 'Facturada',
        icon: 'Receipt'
    },
    PAGADA: {
        next: [],
        terminal: true,
        color: 'green',
        label: 'Pagada',
        icon: 'BadgeCheck'
    },
    CANCELADA: {
        next: [],
        terminal: true,
        color: 'red',
        label: 'Cancelada',
        icon: 'XCircle'
    },
    NO_SHOW: {
        next: [],
        terminal: true,
        color: 'red',
        label: 'No se presentó',
        icon: 'UserX'
    }
}

// ============================================================
// CONSULTAS - 5 Estados
// ============================================================

export type ConsultaStatus =
    | 'INICIADA'
    | 'EN_PROGRESO'
    | 'NOTA_COMPLETA'
    | 'FIRMADA'
    | 'ENVIADA'

export const CONSULTA_STATE_MACHINE: StateMachine<ConsultaStatus> = {
    INICIADA: {
        next: ['EN_PROGRESO'],
        color: 'gray',
        label: 'Iniciada',
        icon: 'Play'
    },
    EN_PROGRESO: {
        next: ['NOTA_COMPLETA'],
        color: 'yellow',
        label: 'En Progreso',
        icon: 'Edit'
    },
    NOTA_COMPLETA: {
        next: ['FIRMADA'],
        color: 'blue',
        label: 'Nota Completa',
        icon: 'FileText'
    },
    FIRMADA: {
        next: ['ENVIADA'],
        color: 'green',
        label: 'Firmada',
        icon: 'PenTool'
    },
    ENVIADA: {
        next: [],
        terminal: true,
        color: 'green',
        label: 'Enviada',
        icon: 'Send'
    }
}

// ============================================================
// FACTURAS - 6 Estados
// ============================================================

export type FacturaStatus =
    | 'BORRADOR'
    | 'EMITIDA'
    | 'ENVIADA'
    | 'PAGADA'
    | 'VENCIDA'
    | 'CANCELADA'

export const FACTURA_STATE_MACHINE: StateMachine<FacturaStatus> = {
    BORRADOR: {
        next: ['EMITIDA', 'CANCELADA'],
        color: 'gray',
        label: 'Borrador',
        icon: 'FileEdit'
    },
    EMITIDA: {
        next: ['ENVIADA', 'PAGADA', 'CANCELADA'],
        color: 'blue',
        label: 'Emitida',
        icon: 'FileCheck'
    },
    ENVIADA: {
        next: ['PAGADA', 'VENCIDA', 'CANCELADA'],
        color: 'purple',
        label: 'Enviada',
        icon: 'Send'
    },
    PAGADA: {
        next: [],
        terminal: true,
        color: 'green',
        label: 'Pagada',
        icon: 'BadgeCheck'
    },
    VENCIDA: {
        next: ['PAGADA', 'CANCELADA'],
        color: 'red',
        label: 'Vencida',
        icon: 'AlertCircle'
    },
    CANCELADA: {
        next: [],
        terminal: true,
        color: 'red',
        label: 'Cancelada',
        icon: 'XCircle'
    }
}

// ============================================================
// ORDENES DE LABORATORIO - 6 Estados
// ============================================================

export type OrdenLabStatus =
    | 'SOLICITADA'
    | 'MUESTRA_TOMADA'
    | 'EN_PROCESO'
    | 'RESULTADO_LISTO'
    | 'VALIDADA'
    | 'ENTREGADA'

export const ORDEN_LAB_STATE_MACHINE: StateMachine<OrdenLabStatus> = {
    SOLICITADA: {
        next: ['MUESTRA_TOMADA'],
        color: 'gray',
        label: 'Solicitada',
        icon: 'FileText'
    },
    MUESTRA_TOMADA: {
        next: ['EN_PROCESO'],
        color: 'blue',
        label: 'Muestra Tomada',
        icon: 'TestTube'
    },
    EN_PROCESO: {
        next: ['RESULTADO_LISTO'],
        color: 'yellow',
        label: 'En Proceso',
        icon: 'Loader'
    },
    RESULTADO_LISTO: {
        next: ['VALIDADA'],
        color: 'orange',
        label: 'Resultado Listo',
        icon: 'FileCheck'
    },
    VALIDADA: {
        next: ['ENTREGADA'],
        color: 'green',
        label: 'Validada',
        icon: 'CheckCircle'
    },
    ENTREGADA: {
        next: [],
        terminal: true,
        color: 'green',
        label: 'Entregada',
        icon: 'PackageCheck'
    }
}

// ============================================================
// SOLICITUDES DE VACACIONES - 4 Estados
// ============================================================

export type VacacionesStatus =
    | 'PENDIENTE'
    | 'APROBADA'
    | 'RECHAZADA'
    | 'CANCELADA'

export const VACACIONES_STATE_MACHINE: StateMachine<VacacionesStatus> = {
    PENDIENTE: {
        next: ['APROBADA', 'RECHAZADA', 'CANCELADA'],
        color: 'yellow',
        label: 'Pendiente',
        icon: 'Clock'
    },
    APROBADA: {
        next: ['CANCELADA'],
        color: 'green',
        label: 'Aprobada',
        icon: 'CheckCircle'
    },
    RECHAZADA: {
        next: [],
        terminal: true,
        color: 'red',
        label: 'Rechazada',
        icon: 'XCircle'
    },
    CANCELADA: {
        next: [],
        terminal: true,
        color: 'gray',
        label: 'Cancelada',
        icon: 'Ban'
    }
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Validates if a transition is allowed
 */
export function canTransition<S extends string>(
    machine: StateMachine<S>,
    currentState: S,
    targetState: S
): boolean {
    const stateConfig = machine[currentState]
    if (!stateConfig) return false
    return stateConfig.next.includes(targetState)
}

/**
 * Gets available next states from current state
 */
export function getNextStates<S extends string>(
    machine: StateMachine<S>,
    currentState: S
): S[] {
    const stateConfig = machine[currentState]
    if (!stateConfig) return []
    return stateConfig.next
}

/**
 * Gets state display info
 */
export function getStateInfo<S extends string>(
    machine: StateMachine<S>,
    state: S
): StateDefinition<S> | null {
    return machine[state] || null
}

/**
 * Checks if state is terminal (no more transitions)
 */
export function isTerminalState<S extends string>(
    machine: StateMachine<S>,
    state: S
): boolean {
    const stateConfig = machine[state]
    if (!stateConfig) return true
    return stateConfig.terminal === true || stateConfig.next.length === 0
}

// ============================================================
// DOMAIN EVENTS (Types for event-driven architecture)
// ============================================================

export type DomainEventType =
    // Citas
    | 'CITA_CREADA'
    | 'CITA_CONFIRMADA'
    | 'CITA_RECORDATORIO_ENVIADO'
    | 'CITA_CHECK_IN'
    | 'CITA_CONSULTA_INICIADA'
    | 'CITA_CERRADA'
    | 'CITA_CANCELADA'
    | 'CITA_NO_SHOW'
    // Consultas
    | 'CONSULTA_INICIADA'
    | 'CONSULTA_CERRADA'
    | 'RECETA_GENERADA'
    // Facturación
    | 'FACTURA_EMITIDA'
    | 'FACTURA_ENVIADA'
    | 'PAGO_RECIBIDO'
    // Laboratorio
    | 'ORDEN_LAB_SOLICITADA'
    | 'RESULTADO_LAB_LISTO'
    | 'RESULTADO_LAB_ENTREGADO'
    // RRHH
    | 'VACACIONES_SOLICITADAS'
    | 'VACACIONES_APROBADAS'
    | 'VACACIONES_RECHAZADAS'

export interface DomainEvent<T extends DomainEventType = DomainEventType> {
    id: string
    type: T
    aggregateType: string
    aggregateId: string
    payload: Record<string, unknown>
    createdAt: Date
    createdBy: string
    empresaId: string
    correlationId?: string
}
