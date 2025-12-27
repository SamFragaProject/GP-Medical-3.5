/**
 * MediFlow ERP - Audit Hook
 * Centralized logging for all significant actions
 * Based on GPT ERP Architecture Recommendations
 */

import { useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'

// ============================================================
// TYPES
// ============================================================

export type AuditAction =
    | 'CREATE'
    | 'READ'
    | 'UPDATE'
    | 'DELETE'
    | 'VIEW'
    | 'EXPORT'
    | 'TRANSITION'
    | 'LOGIN'
    | 'LOGOUT'
    | 'IMPERSONATE'
    | 'PERMISSION_DENIED'

export type AuditEntityType =
    | 'cita'
    | 'consulta'
    | 'paciente'
    | 'factura'
    | 'receta'
    | 'orden_laboratorio'
    | 'resultado_laboratorio'
    | 'empleado'
    | 'vacaciones'
    | 'incidencia'
    | 'inventario'
    | 'usuario'
    | 'empresa'
    | 'sede'
    | 'session'

export interface AuditLogEntry {
    entity_type: AuditEntityType
    entity_id: string
    action: AuditAction
    old_values?: Record<string, unknown>
    new_values?: Record<string, unknown>
    changes?: Record<string, { old: unknown; new: unknown }>
    notes?: string
}

export interface AuditLogRecord extends AuditLogEntry {
    id: string
    user_id: string
    user_email: string
    user_role: string
    timestamp: string
    ip_address?: string
    user_agent?: string
    empresa_id?: string
    sede_id?: string
}

// ============================================================
// HOOK
// ============================================================

export function useAudit() {
    const { user } = useAuth()

    /**
     * Log an action to the audit trail
     */
    const logAction = useCallback(async (entry: AuditLogEntry): Promise<boolean> => {
        if (!user) {
            console.warn('[Audit] No user context, skipping log')
            return false
        }

        try {
            const { error } = await supabase.from('audit_log').insert({
                ...entry,
                user_id: user.id,
                user_email: user.email,
                user_role: user.rol,
                empresa_id: user.empresa_id,
                sede_id: user.sede_id,
                user_agent: navigator.userAgent,
                // IP address will be captured by Supabase Edge if needed
            })

            if (error) {
                console.error('[Audit] Failed to log action:', error)
                return false
            }

            console.debug(`[Audit] ${entry.action} on ${entry.entity_type}:${entry.entity_id}`)
            return true
        } catch (err) {
            console.error('[Audit] Exception:', err)
            return false
        }
    }, [user])

    /**
     * Log a CREATE action
     */
    const logCreate = useCallback(async (
        entityType: AuditEntityType,
        entityId: string,
        values: Record<string, unknown>,
        notes?: string
    ) => {
        return logAction({
            entity_type: entityType,
            entity_id: entityId,
            action: 'CREATE',
            new_values: values,
            notes
        })
    }, [logAction])

    /**
     * Log an UPDATE action with change tracking
     */
    const logUpdate = useCallback(async (
        entityType: AuditEntityType,
        entityId: string,
        oldValues: Record<string, unknown>,
        newValues: Record<string, unknown>,
        notes?: string
    ) => {
        // Calculate what actually changed
        const changes: Record<string, { old: unknown; new: unknown }> = {}

        for (const key of Object.keys(newValues)) {
            if (JSON.stringify(oldValues[key]) !== JSON.stringify(newValues[key])) {
                changes[key] = { old: oldValues[key], new: newValues[key] }
            }
        }

        // Only log if something actually changed
        if (Object.keys(changes).length === 0) {
            console.debug('[Audit] No changes detected, skipping log')
            return true
        }

        return logAction({
            entity_type: entityType,
            entity_id: entityId,
            action: 'UPDATE',
            old_values: oldValues,
            new_values: newValues,
            changes,
            notes
        })
    }, [logAction])

    /**
     * Log a DELETE action
     */
    const logDelete = useCallback(async (
        entityType: AuditEntityType,
        entityId: string,
        deletedValues?: Record<string, unknown>,
        notes?: string
    ) => {
        return logAction({
            entity_type: entityType,
            entity_id: entityId,
            action: 'DELETE',
            old_values: deletedValues,
            notes
        })
    }, [logAction])

    /**
     * Log a VIEW action (for sensitive data access tracking)
     */
    const logView = useCallback(async (
        entityType: AuditEntityType,
        entityId: string,
        notes?: string
    ) => {
        return logAction({
            entity_type: entityType,
            entity_id: entityId,
            action: 'VIEW',
            notes
        })
    }, [logAction])

    /**
     * Log an EXPORT action (for compliance)
     */
    const logExport = useCallback(async (
        entityType: AuditEntityType,
        entityId: string,
        format: string,
        notes?: string
    ) => {
        return logAction({
            entity_type: entityType,
            entity_id: entityId,
            action: 'EXPORT',
            new_values: { format, timestamp: new Date().toISOString() },
            notes
        })
    }, [logAction])

    /**
     * Log a state TRANSITION
     */
    const logTransition = useCallback(async (
        entityType: AuditEntityType,
        entityId: string,
        fromState: string,
        toState: string,
        reason?: string
    ) => {
        return logAction({
            entity_type: entityType,
            entity_id: entityId,
            action: 'TRANSITION',
            old_values: { status: fromState },
            new_values: { status: toState },
            changes: { status: { old: fromState, new: toState } },
            notes: reason
        })
    }, [logAction])

    /**
     * Log permission denied (for security monitoring)
     */
    const logPermissionDenied = useCallback(async (
        resource: string,
        action: string,
        notes?: string
    ) => {
        return logAction({
            entity_type: 'session' as AuditEntityType,
            entity_id: user?.id || 'unknown',
            action: 'PERMISSION_DENIED',
            new_values: { resource, attemptedAction: action },
            notes
        })
    }, [logAction, user])

    return {
        logAction,
        logCreate,
        logUpdate,
        logDelete,
        logView,
        logExport,
        logTransition,
        logPermissionDenied
    }
}

// ============================================================
// STANDALONE FUNCTION (for use outside React components)
// ============================================================

export async function auditLog(
    entry: AuditLogEntry & {
        user_id: string
        user_email: string
        user_role: string
        empresa_id?: string
    }
): Promise<boolean> {
    try {
        const { error } = await supabase.from('audit_log').insert({
            ...entry,
            user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
        })

        if (error) {
            console.error('[Audit] Failed:', error)
            return false
        }
        return true
    } catch (err) {
        console.error('[Audit] Exception:', err)
        return false
    }
}
