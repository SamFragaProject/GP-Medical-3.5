/**
 * MediFlow ERP - State History Component
 * Shows the timeline of state transitions for an entity
 */

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'
import * as LucideIcons from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
    StateMachine,
    getStateInfo,
    CITA_STATE_MACHINE,
    CONSULTA_STATE_MACHINE,
    FACTURA_STATE_MACHINE,
    ORDEN_LAB_STATE_MACHINE,
    VACACIONES_STATE_MACHINE
} from '@/config/stateMachines'

// ============================================================
// TYPES
// ============================================================

interface StateTransitionRecord {
    id: string
    entity_type: string
    entity_id: string
    from_state: string
    to_state: string
    transitioned_by: string | null
    transitioned_at: string
    reason: string | null
    metadata: Record<string, unknown> | null
    // Joined data
    user_name?: string
    user_email?: string
}

export interface StateHistoryProps {
    /** Entity type (e.g., 'cita', 'consulta') */
    entityType: 'cita' | 'consulta' | 'factura' | 'orden_laboratorio' | 'solicitudes_vacaciones'
    /** ID of the entity */
    entityId: string
    /** Optional: Max items to show */
    limit?: number
    /** Optional: Show card wrapper */
    showCard?: boolean
    /** Optional: Compact mode */
    compact?: boolean
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function getMachineForType(entityType: string): StateMachine<string> | null {
    switch (entityType) {
        case 'cita':
        case 'citas':
            return CITA_STATE_MACHINE as StateMachine<string>
        case 'consulta':
        case 'consultas':
            return CONSULTA_STATE_MACHINE as StateMachine<string>
        case 'factura':
        case 'facturas':
            return FACTURA_STATE_MACHINE as StateMachine<string>
        case 'orden_laboratorio':
        case 'ordenes_laboratorio':
            return ORDEN_LAB_STATE_MACHINE as StateMachine<string>
        case 'solicitudes_vacaciones':
            return VACACIONES_STATE_MACHINE as StateMachine<string>
        default:
            return null
    }
}

function getIcon(iconName: string) {
    const Icon = (LucideIcons as any)[iconName] || LucideIcons.Circle
    return Icon
}

function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-MX', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date)
}

function formatRelativeTime(dateString: string): string {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMins < 1) return 'Hace un momento'
    if (diffMins < 60) return `Hace ${diffMins} min`
    if (diffHours < 24) return `Hace ${diffHours}h`
    if (diffDays < 7) return `Hace ${diffDays} días`
    return formatDate(dateString)
}

// ============================================================
// COMPONENT
// ============================================================

export function StateHistory({
    entityType,
    entityId,
    limit = 10,
    showCard = true,
    compact = false
}: StateHistoryProps) {
    const [transitions, setTransitions] = useState<StateTransitionRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const machine = getMachineForType(entityType)

    useEffect(() => {
        loadTransitions()
    }, [entityType, entityId])

    const loadTransitions = async () => {
        setLoading(true)
        setError(null)

        try {
            const { data, error: fetchError } = await supabase
                .from('state_transitions')
                .select(`
          id,
          entity_type,
          entity_id,
          from_state,
          to_state,
          transitioned_by,
          transitioned_at,
          reason,
          metadata
        `)
                .eq('entity_type', entityType.endsWith('s') ? entityType : `${entityType}s`)
                .eq('entity_id', entityId)
                .order('transitioned_at', { ascending: false })
                .limit(limit)

            if (fetchError) throw fetchError

            // Try to get user names
            const transitionsWithUsers = await Promise.all(
                (data || []).map(async (t) => {
                    if (t.transitioned_by) {
                        const { data: userData } = await supabase
                            .from('usuarios')
                            .select('nombre, apellido_paterno, email')
                            .eq('id', t.transitioned_by)
                            .single()

                        return {
                            ...t,
                            user_name: userData ? `${userData.nombre} ${userData.apellido_paterno || ''}`.trim() : null,
                            user_email: userData?.email
                        }
                    }
                    return t
                })
            )

            setTransitions(transitionsWithUsers)
        } catch (err: any) {
            console.error('Error loading transitions:', err)
            setError(err.message || 'Error al cargar historial')
        } finally {
            setLoading(false)
        }
    }

    const content = (
        <div className={compact ? 'space-y-2' : 'space-y-4'}>
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : error ? (
                <div className="text-center py-4 text-red-500">
                    <LucideIcons.AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">{error}</p>
                </div>
            ) : transitions.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                    <LucideIcons.History className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Sin historial de cambios</p>
                </div>
            ) : (
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200" />

                    {transitions.map((transition, index) => {
                        const toStateInfo = machine ? getStateInfo(machine, transition.to_state) : null
                        const ToIcon = toStateInfo ? getIcon(toStateInfo.icon) : LucideIcons.Circle

                        return (
                            <motion.div
                                key={transition.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`relative flex gap-4 ${compact ? 'py-2' : 'py-3'}`}
                            >
                                {/* Icon */}
                                <div
                                    className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 border-white shadow-sm ${toStateInfo
                                            ? `bg-${toStateInfo.color}-100 text-${toStateInfo.color}-600`
                                            : 'bg-slate-100 text-slate-600'
                                        }`}
                                    style={{
                                        backgroundColor: toStateInfo?.color === 'green' ? '#dcfce7' :
                                            toStateInfo?.color === 'red' ? '#fee2e2' :
                                                toStateInfo?.color === 'blue' ? '#dbeafe' :
                                                    toStateInfo?.color === 'yellow' ? '#fef9c3' :
                                                        toStateInfo?.color === 'purple' ? '#f3e8ff' :
                                                            toStateInfo?.color === 'orange' ? '#ffedd5' :
                                                                '#f1f5f9'
                                    }}
                                >
                                    <ToIcon className="w-4 h-4" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Badge variant="outline" className="text-xs">
                                            {transition.from_state}
                                        </Badge>
                                        <LucideIcons.ArrowRight className="w-3 h-3 text-slate-400" />
                                        <Badge
                                            className="text-xs"
                                            style={{
                                                backgroundColor: toStateInfo?.color === 'green' ? '#22c55e' :
                                                    toStateInfo?.color === 'red' ? '#ef4444' :
                                                        toStateInfo?.color === 'blue' ? '#3b82f6' :
                                                            toStateInfo?.color === 'yellow' ? '#eab308' :
                                                                toStateInfo?.color === 'purple' ? '#a855f7' :
                                                                    toStateInfo?.color === 'orange' ? '#f97316' :
                                                                        '#64748b',
                                                color: 'white'
                                            }}
                                        >
                                            {toStateInfo?.label || transition.to_state}
                                        </Badge>
                                    </div>

                                    {!compact && (
                                        <div className="mt-1 text-sm text-slate-500">
                                            {transition.user_name ? (
                                                <span className="font-medium text-slate-700">{transition.user_name}</span>
                                            ) : (
                                                <span className="italic">Usuario desconocido</span>
                                            )}
                                            <span className="mx-1">•</span>
                                            <span title={formatDate(transition.transitioned_at)}>
                                                {formatRelativeTime(transition.transitioned_at)}
                                            </span>
                                        </div>
                                    )}

                                    {transition.reason && !compact && (
                                        <p className="mt-1 text-sm text-slate-600 italic">
                                            "{transition.reason}"
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}
        </div>
    )

    if (!showCard) return content

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <LucideIcons.History className="w-5 h-5 text-slate-400" />
                    Historial de Cambios
                </CardTitle>
            </CardHeader>
            <CardContent>{content}</CardContent>
        </Card>
    )
}

// ============================================================
// SPECIALIZED COMPONENTS
// ============================================================

export function CitaHistory({ citaId, ...props }: { citaId: string } & Omit<StateHistoryProps, 'entityType' | 'entityId'>) {
    return <StateHistory entityType="cita" entityId={citaId} {...props} />
}

export function ConsultaHistory({ consultaId, ...props }: { consultaId: string } & Omit<StateHistoryProps, 'entityType' | 'entityId'>) {
    return <StateHistory entityType="consulta" entityId={consultaId} {...props} />
}

export function FacturaHistory({ facturaId, ...props }: { facturaId: string } & Omit<StateHistoryProps, 'entityType' | 'entityId'>) {
    return <StateHistory entityType="factura" entityId={facturaId} {...props} />
}
