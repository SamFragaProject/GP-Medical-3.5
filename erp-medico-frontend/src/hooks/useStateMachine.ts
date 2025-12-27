/**
 * MediFlow ERP - State Machine Hook
 * Validates and executes state transitions with audit logging
 * Based on GPT ERP Architecture Recommendations
 */

import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useAudit } from './useAudit'
import { useDomainEvents } from './useDomainEvents'
import {
    StateMachine,
    canTransition,
    getNextStates,
    getStateInfo,
    isTerminalState,
    // State machines
    CITA_STATE_MACHINE,
    CONSULTA_STATE_MACHINE,
    FACTURA_STATE_MACHINE,
    ORDEN_LAB_STATE_MACHINE,
    VACACIONES_STATE_MACHINE,
    // Types
    CitaStatus,
    ConsultaStatus,
    FacturaStatus,
    OrdenLabStatus,
    VacacionesStatus,
    DomainEventType
} from '@/config/stateMachines'
import toast from 'react-hot-toast'

// ============================================================
// TYPES
// ============================================================

export interface TransitionResult {
    success: boolean
    error?: string
    fromState: string
    toState: string
    transitionId?: string
}

interface TransitionOptions {
    reason?: string
    skipEvent?: boolean
    metadata?: Record<string, unknown>
}

// ============================================================
// HOOK
// ============================================================

export function useStateMachine() {
    const { user } = useAuth()
    const { logTransition } = useAudit()
    const { emit } = useDomainEvents()

    /**
     * Generic transition function for any entity
     */
    const transition = useCallback(async <S extends string>(
        machine: StateMachine<S>,
        tableName: string,
        entityId: string,
        currentState: S,
        targetState: S,
        eventType?: DomainEventType,
        options?: TransitionOptions
    ): Promise<TransitionResult> => {
        // Validate transition is allowed
        if (!canTransition(machine, currentState, targetState)) {
            const error = `Transición no permitida: ${currentState} → ${targetState}`
            toast.error(error)
            return { success: false, error, fromState: currentState, toState: targetState }
        }

        try {
            // Update the entity in database
            const { error: updateError } = await supabase
                .from(tableName)
                .update({
                    status: targetState,
                    updated_at: new Date().toISOString()
                })
                .eq('id', entityId)

            if (updateError) {
                const error = `Error actualizando ${tableName}: ${updateError.message}`
                toast.error(error)
                return { success: false, error, fromState: currentState, toState: targetState }
            }

            // Log the transition to state_transitions table
            const { data: transitionData } = await supabase
                .from('state_transitions')
                .insert({
                    entity_type: tableName,
                    entity_id: entityId,
                    from_state: currentState,
                    to_state: targetState,
                    transitioned_by: user?.id,
                    reason: options?.reason,
                    metadata: options?.metadata,
                    empresa_id: user?.empresa_id
                })
                .select('id')
                .single()

            // Log to audit trail
            await logTransition(
                tableName as any,
                entityId,
                currentState,
                targetState,
                options?.reason
            )

            // Emit domain event if specified
            if (eventType && !options?.skipEvent) {
                await emit(eventType, tableName, entityId, {
                    from_state: currentState,
                    to_state: targetState,
                    ...options?.metadata
                })
            }

            const stateInfo = getStateInfo(machine, targetState)
            toast.success(`Estado cambiado a: ${stateInfo?.label || targetState}`)

            return {
                success: true,
                fromState: currentState,
                toState: targetState,
                transitionId: transitionData?.id
            }
        } catch (err: any) {
            const error = err.message || 'Error desconocido'
            toast.error(error)
            return { success: false, error, fromState: currentState, toState: targetState }
        }
    }, [user, logTransition, emit])

    // ============================================================
    // SPECIALIZED TRANSITION FUNCTIONS
    // ============================================================

    /**
     * Transition a Cita to a new state
     */
    const transitionCita = useCallback((
        citaId: string,
        currentState: CitaStatus,
        targetState: CitaStatus,
        options?: TransitionOptions
    ) => {
        // Map target state to event type
        const eventMap: Partial<Record<CitaStatus, DomainEventType>> = {
            'CONFIRMADA': 'CITA_CONFIRMADA',
            'CHECK_IN': 'CITA_CHECK_IN',
            'EN_CONSULTA': 'CITA_CONSULTA_INICIADA',
            'CERRADA': 'CITA_CERRADA',
            'CANCELADA': 'CITA_CANCELADA',
            'NO_SHOW': 'CITA_NO_SHOW'
        }

        return transition(
            CITA_STATE_MACHINE,
            'citas',
            citaId,
            currentState,
            targetState,
            eventMap[targetState],
            options
        )
    }, [transition])

    /**
     * Transition a Consulta to a new state
     */
    const transitionConsulta = useCallback((
        consultaId: string,
        currentState: ConsultaStatus,
        targetState: ConsultaStatus,
        options?: TransitionOptions
    ) => {
        const eventMap: Partial<Record<ConsultaStatus, DomainEventType>> = {
            'INICIADA': 'CONSULTA_INICIADA',
            'ENVIADA': 'CONSULTA_CERRADA' // Final state
        }

        return transition(
            CONSULTA_STATE_MACHINE,
            'consultas',
            consultaId,
            currentState,
            targetState,
            eventMap[targetState],
            options
        )
    }, [transition])

    /**
     * Transition a Factura to a new state
     */
    const transitionFactura = useCallback((
        facturaId: string,
        currentState: FacturaStatus,
        targetState: FacturaStatus,
        options?: TransitionOptions
    ) => {
        const eventMap: Partial<Record<FacturaStatus, DomainEventType>> = {
            'EMITIDA': 'FACTURA_EMITIDA',
            'ENVIADA': 'FACTURA_ENVIADA',
            'PAGADA': 'PAGO_RECIBIDO'
        }

        return transition(
            FACTURA_STATE_MACHINE,
            'facturas',
            facturaId,
            currentState,
            targetState,
            eventMap[targetState],
            options
        )
    }, [transition])

    /**
     * Transition an Orden de Laboratorio to a new state
     */
    const transitionOrdenLab = useCallback((
        ordenId: string,
        currentState: OrdenLabStatus,
        targetState: OrdenLabStatus,
        options?: TransitionOptions
    ) => {
        const eventMap: Partial<Record<OrdenLabStatus, DomainEventType>> = {
            'SOLICITADA': 'ORDEN_LAB_SOLICITADA',
            'RESULTADO_LISTO': 'RESULTADO_LAB_LISTO',
            'ENTREGADA': 'RESULTADO_LAB_ENTREGADO'
        }

        return transition(
            ORDEN_LAB_STATE_MACHINE,
            'ordenes_laboratorio',
            ordenId,
            currentState,
            targetState,
            eventMap[targetState],
            options
        )
    }, [transition])

    /**
     * Transition a Solicitud de Vacaciones to a new state
     */
    const transitionVacaciones = useCallback((
        solicitudId: string,
        currentState: VacacionesStatus,
        targetState: VacacionesStatus,
        options?: TransitionOptions
    ) => {
        const eventMap: Partial<Record<VacacionesStatus, DomainEventType>> = {
            'APROBADA': 'VACACIONES_APROBADAS',
            'RECHAZADA': 'VACACIONES_RECHAZADAS'
        }

        return transition(
            VACACIONES_STATE_MACHINE,
            'solicitudes_vacaciones',
            solicitudId,
            currentState,
            targetState,
            eventMap[targetState],
            options
        )
    }, [transition])

    // ============================================================
    // UI HELPERS
    // ============================================================

    /**
     * Get available actions for current state
     */
    const getAvailableActions = useCallback(<S extends string>(
        machine: StateMachine<S>,
        currentState: S
    ) => {
        const nextStates = getNextStates(machine, currentState)
        return nextStates.map(state => {
            const info = getStateInfo(machine, state)
            return {
                state,
                label: info?.label || state,
                icon: info?.icon || 'ArrowRight',
                color: info?.color || 'gray'
            }
        })
    }, [])

    /**
     * Check if entity can still be modified
     */
    const canModify = useCallback(<S extends string>(
        machine: StateMachine<S>,
        currentState: S
    ): boolean => {
        return !isTerminalState(machine, currentState)
    }, [])

    return {
        // Generic
        transition,
        getAvailableActions,
        canModify,
        // Specialized
        transitionCita,
        transitionConsulta,
        transitionFactura,
        transitionOrdenLab,
        transitionVacaciones,
        // Re-export state machines for convenience
        machines: {
            cita: CITA_STATE_MACHINE,
            consulta: CONSULTA_STATE_MACHINE,
            factura: FACTURA_STATE_MACHINE,
            ordenLab: ORDEN_LAB_STATE_MACHINE,
            vacaciones: VACACIONES_STATE_MACHINE
        }
    }
}
