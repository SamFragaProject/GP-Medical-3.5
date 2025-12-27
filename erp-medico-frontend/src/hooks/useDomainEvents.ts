/**
 * MediFlow ERP - Domain Events Hook
 * Event-driven architecture for loose coupling between modules
 * Based on GPT ERP Architecture Recommendations
 */

import { useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { DomainEventType } from '@/config/stateMachines'

// ============================================================
// TYPES
// ============================================================

export interface EmitEventOptions {
    correlationId?: string
    causationId?: string
}

export interface DomainEventRecord {
    id: string
    event_type: DomainEventType
    aggregate_type: string
    aggregate_id: string
    payload: Record<string, unknown>
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
    created_at: string
    created_by: string
    empresa_id: string
    correlation_id?: string
    causation_id?: string
    processed_at?: string
    error_message?: string
    retry_count: number
}

export type EventHandler = (event: DomainEventRecord) => Promise<void> | void

// ============================================================
// HOOK
// ============================================================

export function useDomainEvents() {
    const { user } = useAuth()

    /**
     * Emit a domain event
     */
    const emit = useCallback(async (
        eventType: DomainEventType,
        aggregateType: string,
        aggregateId: string,
        payload: Record<string, unknown>,
        options?: EmitEventOptions
    ): Promise<string | null> => {
        if (!user) {
            console.warn('[DomainEvents] No user context, cannot emit event')
            return null
        }

        try {
            const { data, error } = await supabase
                .from('domain_events')
                .insert({
                    event_type: eventType,
                    aggregate_type: aggregateType,
                    aggregate_id: aggregateId,
                    payload,
                    created_by: user.id,
                    empresa_id: user.empresa_id,
                    correlation_id: options?.correlationId,
                    causation_id: options?.causationId,
                    status: 'PENDING'
                })
                .select('id')
                .single()

            if (error) {
                console.error('[DomainEvents] Failed to emit:', error)
                return null
            }

            console.debug(`[DomainEvents] Emitted ${eventType} for ${aggregateType}:${aggregateId}`)
            return data.id
        } catch (err) {
            console.error('[DomainEvents] Exception:', err)
            return null
        }
    }, [user])

    /**
     * Subscribe to domain events (Realtime)
     */
    const subscribe = useCallback((
        eventTypes: DomainEventType[],
        handler: EventHandler
    ) => {
        const channel = supabase
            .channel('domain_events_subscription')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'domain_events',
                    filter: eventTypes.length > 0
                        ? `event_type=in.(${eventTypes.join(',')})`
                        : undefined
                },
                async (payload) => {
                    const event = payload.new as DomainEventRecord
                    console.debug(`[DomainEvents] Received ${event.event_type}`)

                    try {
                        await handler(event)
                    } catch (err) {
                        console.error('[DomainEvents] Handler error:', err)
                    }
                }
            )
            .subscribe()

        // Return unsubscribe function
        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    /**
     * Mark event as completed
     */
    const markCompleted = useCallback(async (eventId: string): Promise<boolean> => {
        const { error } = await supabase
            .from('domain_events')
            .update({
                status: 'COMPLETED',
                processed_at: new Date().toISOString()
            })
            .eq('id', eventId)

        if (error) {
            console.error('[DomainEvents] Failed to mark completed:', error)
            return false
        }
        return true
    }, [])

    /**
     * Mark event as failed
     */
    const markFailed = useCallback(async (
        eventId: string,
        errorMessage: string
    ): Promise<boolean> => {
        const { data: currentEvent } = await supabase
            .from('domain_events')
            .select('retry_count')
            .eq('id', eventId)
            .single()

        const { error } = await supabase
            .from('domain_events')
            .update({
                status: 'FAILED',
                error_message: errorMessage,
                retry_count: (currentEvent?.retry_count || 0) + 1
            })
            .eq('id', eventId)

        if (error) {
            console.error('[DomainEvents] Failed to mark failed:', error)
            return false
        }
        return true
    }, [])

    // ============================================================
    // CONVENIENCE METHODS FOR COMMON EVENTS
    // ============================================================

    const emitCitaConfirmada = useCallback((citaId: string, payload: {
        paciente_id: string
        medico_id: string
        fecha: string
        hora: string
    }) => emit('CITA_CONFIRMADA', 'cita', citaId, payload), [emit])

    const emitCitaCerrada = useCallback((citaId: string, payload: {
        paciente_id: string
        medico_id: string
        servicios: unknown[]
        total?: number
    }) => emit('CITA_CERRADA', 'cita', citaId, payload), [emit])

    const emitConsultaCerrada = useCallback((consultaId: string, payload: {
        cita_id: string
        paciente_id: string
        medico_id: string
        diagnosticos: string[]
        recetas?: unknown[]
    }) => emit('CONSULTA_CERRADA', 'consulta', consultaId, payload), [emit])

    const emitFacturaEmitida = useCallback((facturaId: string, payload: {
        paciente_id: string
        total: number
        servicios: unknown[]
    }) => emit('FACTURA_EMITIDA', 'factura', facturaId, payload), [emit])

    const emitPagoRecibido = useCallback((facturaId: string, payload: {
        monto: number
        metodo_pago: string
        referencia?: string
    }) => emit('PAGO_RECIBIDO', 'factura', facturaId, payload), [emit])

    const emitResultadoLabListo = useCallback((ordenId: string, payload: {
        paciente_id: string
        medico_id: string
        examenes: string[]
    }) => emit('RESULTADO_LAB_LISTO', 'orden_laboratorio', ordenId, payload), [emit])

    return {
        emit,
        subscribe,
        markCompleted,
        markFailed,
        // Convenience methods
        emitCitaConfirmada,
        emitCitaCerrada,
        emitConsultaCerrada,
        emitFacturaEmitida,
        emitPagoRecibido,
        emitResultadoLabListo
    }
}

// ============================================================
// EVENT HANDLERS REGISTRY (for Edge Functions or frontend)
// ============================================================

export const EVENT_HANDLERS: Partial<Record<DomainEventType, string>> = {
    // Map event types to their handlers (Edge Function names or component paths)
    'CITA_CONFIRMADA': 'send-appointment-reminder',
    'CONSULTA_CERRADA': 'auto-create-invoice',
    'FACTURA_EMITIDA': 'send-invoice-notification',
    'PAGO_RECIBIDO': 'send-payment-confirmation',
    'RESULTADO_LAB_LISTO': 'notify-patient-results',
}
