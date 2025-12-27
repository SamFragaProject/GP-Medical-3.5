/**
 * MediFlow ERP - State Badge Component
 * Displays current state as a styled badge with icon
 */

import React from 'react'
import * as LucideIcons from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
    StateMachine,
    getStateInfo,
    isTerminalState,
    CITA_STATE_MACHINE,
    CONSULTA_STATE_MACHINE,
    FACTURA_STATE_MACHINE,
    ORDEN_LAB_STATE_MACHINE,
    VACACIONES_STATE_MACHINE,
    CitaStatus,
    ConsultaStatus,
    FacturaStatus,
    OrdenLabStatus,
    VacacionesStatus
} from '@/config/stateMachines'

// ============================================================
// TYPES
// ============================================================

export interface StateBadgeProps<S extends string> {
    /** The state machine to use */
    machine: StateMachine<S>
    /** Current state */
    state: S
    /** Optional: Show icon */
    showIcon?: boolean
    /** Optional: Size variant */
    size?: 'sm' | 'default' | 'lg'
    /** Optional: Pulse animation for non-terminal states */
    pulse?: boolean
    /** Optional: Custom label override */
    label?: string
}

// ============================================================
// COMPONENT
// ============================================================

export function StateBadge<S extends string>({
    machine,
    state,
    showIcon = true,
    size = 'default',
    pulse = false,
    label
}: StateBadgeProps<S>) {
    const stateInfo = getStateInfo(machine, state)
    const isTerminal = isTerminalState(machine, state)

    if (!stateInfo) {
        return (
            <Badge variant="outline" className="text-slate-500">
                {label || state}
            </Badge>
        )
    }

    const Icon = (LucideIcons as any)[stateInfo.icon] || LucideIcons.Circle

    const colorStyles: Record<string, string> = {
        gray: 'bg-gray-100 text-gray-700 border-gray-300',
        blue: 'bg-blue-100 text-blue-700 border-blue-300',
        yellow: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        green: 'bg-green-100 text-green-700 border-green-300',
        red: 'bg-red-100 text-red-700 border-red-300',
        purple: 'bg-purple-100 text-purple-700 border-purple-300',
        orange: 'bg-orange-100 text-orange-700 border-orange-300'
    }

    const sizeStyles = {
        sm: 'text-xs px-2 py-0.5',
        default: 'text-sm px-2.5 py-1',
        lg: 'text-base px-3 py-1.5'
    }

    const iconSizes = {
        sm: 'w-3 h-3',
        default: 'w-4 h-4',
        lg: 'w-5 h-5'
    }

    return (
        <span
            className={`
        inline-flex items-center gap-1.5 rounded-full border font-medium
        ${colorStyles[stateInfo.color] || colorStyles.gray}
        ${sizeStyles[size]}
        ${pulse && !isTerminal ? 'animate-pulse' : ''}
      `}
        >
            {showIcon && <Icon className={iconSizes[size]} />}
            <span>{label || stateInfo.label}</span>
            {isTerminal && (
                <LucideIcons.Lock className={`${iconSizes[size]} opacity-50`} />
            )}
        </span>
    )
}

// ============================================================
// SPECIALIZED COMPONENTS
// ============================================================

export function CitaStateBadge({ status, ...props }: { status: CitaStatus } & Omit<StateBadgeProps<CitaStatus>, 'machine' | 'state'>) {
    return <StateBadge machine={CITA_STATE_MACHINE} state={status} {...props} />
}

export function ConsultaStateBadge({ status, ...props }: { status: ConsultaStatus } & Omit<StateBadgeProps<ConsultaStatus>, 'machine' | 'state'>) {
    return <StateBadge machine={CONSULTA_STATE_MACHINE} state={status} {...props} />
}

export function FacturaStateBadge({ status, ...props }: { status: FacturaStatus } & Omit<StateBadgeProps<FacturaStatus>, 'machine' | 'state'>) {
    return <StateBadge machine={FACTURA_STATE_MACHINE} state={status} {...props} />
}

export function OrdenLabStateBadge({ status, ...props }: { status: OrdenLabStatus } & Omit<StateBadgeProps<OrdenLabStatus>, 'machine' | 'state'>) {
    return <StateBadge machine={ORDEN_LAB_STATE_MACHINE} state={status} {...props} />
}

export function VacacionesStateBadge({ status, ...props }: { status: VacacionesStatus } & Omit<StateBadgeProps<VacacionesStatus>, 'machine' | 'state'>) {
    return <StateBadge machine={VACACIONES_STATE_MACHINE} state={status} {...props} />
}

// ============================================================
// STATE PROGRESS INDICATOR
// Shows progress through states (FOR LINEAR WORKFLOWS)
// ============================================================

interface StateProgressProps<S extends string> {
    machine: StateMachine<S>
    currentState: S
    /** Ordered list of states to show in progress */
    stateOrder: S[]
    /** Show labels under each step */
    showLabels?: boolean
}

export function StateProgress<S extends string>({
    machine,
    currentState,
    stateOrder,
    showLabels = true
}: StateProgressProps<S>) {
    const currentIndex = stateOrder.indexOf(currentState)

    return (
        <div className="w-full">
            <div className="flex items-center justify-between">
                {stateOrder.map((state, index) => {
                    const stateInfo = getStateInfo(machine, state)
                    const Icon = stateInfo ? (LucideIcons as any)[stateInfo.icon] : LucideIcons.Circle
                    const isActive = index === currentIndex
                    const isCompleted = index < currentIndex
                    const isFuture = index > currentIndex

                    return (
                        <React.Fragment key={state}>
                            {/* Step */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={`
                    w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all
                    ${isActive ? 'border-blue-500 bg-blue-500 text-white scale-110' : ''}
                    ${isCompleted ? 'border-green-500 bg-green-500 text-white' : ''}
                    ${isFuture ? 'border-gray-300 bg-white text-gray-400' : ''}
                  `}
                                >
                                    {isCompleted ? (
                                        <LucideIcons.Check className="w-5 h-5" />
                                    ) : (
                                        <Icon className="w-5 h-5" />
                                    )}
                                </div>
                                {showLabels && stateInfo && (
                                    <span
                                        className={`
                      mt-2 text-xs font-medium text-center max-w-[80px]
                      ${isActive ? 'text-blue-600' : ''}
                      ${isCompleted ? 'text-green-600' : ''}
                      ${isFuture ? 'text-gray-400' : ''}
                    `}
                                    >
                                        {stateInfo.label}
                                    </span>
                                )}
                            </div>

                            {/* Connector */}
                            {index < stateOrder.length - 1 && (
                                <div
                                    className={`
                    flex-1 h-1 mx-2 rounded transition-all
                    ${index < currentIndex ? 'bg-green-500' : 'bg-gray-200'}
                  `}
                                />
                            )}
                        </React.Fragment>
                    )
                })}
            </div>
        </div>
    )
}

// ============================================================
// CITA PROGRESS (Common use case)
// ============================================================

export function CitaProgress({ currentStatus }: { currentStatus: CitaStatus }) {
    // Main flow (excluding cancel/no-show paths)
    const mainFlow: CitaStatus[] = [
        'BORRADOR',
        'CONFIRMADA',
        'CHECK_IN',
        'EN_CONSULTA',
        'CERRADA',
        'FACTURADA',
        'PAGADA'
    ]

    return (
        <StateProgress
            machine={CITA_STATE_MACHINE}
            currentState={currentStatus}
            stateOrder={mainFlow}
        />
    )
}
