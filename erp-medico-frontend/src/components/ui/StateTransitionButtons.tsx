/**
 * MediFlow ERP - State Transition Buttons Component
 * Shows available actions based on current state of an entity
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import * as LucideIcons from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { useStateMachine } from '@/hooks/useStateMachine'
import {
    StateMachine,
    getStateInfo,
    getNextStates,
    isTerminalState,
    CITA_STATE_MACHINE,
    CONSULTA_STATE_MACHINE,
    FACTURA_STATE_MACHINE,
    CitaStatus,
    ConsultaStatus,
    FacturaStatus
} from '@/config/stateMachines'

// ============================================================
// TYPES
// ============================================================

export interface StateTransitionButtonsProps<S extends string> {
    /** The state machine to use */
    machine: StateMachine<S>
    /** Current state of the entity */
    currentState: S
    /** ID of the entity */
    entityId: string
    /** Transition function to call */
    onTransition: (targetState: S, reason?: string) => Promise<{ success: boolean; error?: string }>
    /** Optional: Show reason input dialog */
    requireReason?: boolean
    /** Optional: Custom labels */
    labels?: Partial<Record<S, string>>
    /** Optional: Size variant */
    size?: 'sm' | 'default' | 'lg'
    /** Optional: Layout direction */
    direction?: 'horizontal' | 'vertical'
    /** Optional: Show current state badge */
    showCurrentState?: boolean
    /** Optional: Loading state */
    loading?: boolean
    /** Optional: Disabled states */
    disabled?: boolean
}

// ============================================================
// COMPONENT
// ============================================================

export function StateTransitionButtons<S extends string>({
    machine,
    currentState,
    entityId,
    onTransition,
    requireReason = false,
    labels,
    size = 'default',
    direction = 'horizontal',
    showCurrentState = true,
    loading = false,
    disabled = false
}: StateTransitionButtonsProps<S>) {
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [pendingState, setPendingState] = useState<S | null>(null)
    const [reason, setReason] = useState('')
    const [isTransitioning, setIsTransitioning] = useState(false)

    const nextStates = getNextStates(machine, currentState)
    const currentStateInfo = getStateInfo(machine, currentState)
    const isTerminal = isTerminalState(machine, currentState)

    const handleStateClick = (targetState: S) => {
        if (requireReason) {
            setPendingState(targetState)
            setIsDialogOpen(true)
        } else {
            executeTransition(targetState)
        }
    }

    const executeTransition = async (targetState: S, transitionReason?: string) => {
        setIsTransitioning(true)
        try {
            await onTransition(targetState, transitionReason)
        } finally {
            setIsTransitioning(false)
            setIsDialogOpen(false)
            setReason('')
            setPendingState(null)
        }
    }

    const getButtonVariant = (stateInfo: ReturnType<typeof getStateInfo>) => {
        if (!stateInfo) return 'secondary'
        switch (stateInfo.color) {
            case 'green': return 'default'
            case 'red': return 'destructive'
            case 'blue': return 'default'
            case 'yellow': return 'secondary'
            case 'purple': return 'default'
            default: return 'outline'
        }
    }

    const getIcon = (iconName: string) => {
        const Icon = (LucideIcons as any)[iconName] || LucideIcons.ArrowRight
        return <Icon className="w-4 h-4" />
    }

    const getColorClasses = (color: string) => {
        switch (color) {
            case 'green': return 'bg-green-500 hover:bg-green-600 text-white'
            case 'red': return 'bg-red-500 hover:bg-red-600 text-white'
            case 'blue': return 'bg-blue-500 hover:bg-blue-600 text-white'
            case 'yellow': return 'bg-yellow-500 hover:bg-yellow-600 text-white'
            case 'purple': return 'bg-purple-500 hover:bg-purple-600 text-white'
            case 'orange': return 'bg-orange-500 hover:bg-orange-600 text-white'
            case 'gray': return 'bg-gray-500 hover:bg-gray-600 text-white'
            default: return 'bg-slate-500 hover:bg-slate-600 text-white'
        }
    }

    if (isTerminal) {
        return (
            <div className="flex items-center gap-2">
                {showCurrentState && currentStateInfo && (
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getColorClasses(currentStateInfo.color)}`}>
                        {getIcon(currentStateInfo.icon)}
                        <span>{labels?.[currentState] || currentStateInfo.label}</span>
                        <span className="opacity-75">(Final)</span>
                    </div>
                )}
            </div>
        )
    }

    return (
        <>
            <div className={`flex ${direction === 'vertical' ? 'flex-col' : 'flex-row flex-wrap'} gap-2 items-center`}>
                {/* Current State Badge */}
                {showCurrentState && currentStateInfo && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium ${getColorClasses(currentStateInfo.color)}`}
                    >
                        {getIcon(currentStateInfo.icon)}
                        <span>{labels?.[currentState] || currentStateInfo.label}</span>
                    </motion.div>
                )}

                {/* Separator */}
                {showCurrentState && nextStates.length > 0 && (
                    <LucideIcons.ArrowRight className="w-4 h-4 text-slate-400" />
                )}

                {/* Transition Buttons */}
                <AnimatePresence mode="popLayout">
                    {nextStates.map((state, index) => {
                        const stateInfo = getStateInfo(machine, state)
                        if (!stateInfo) return null

                        return (
                            <motion.div
                                key={state}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <Button
                                    variant="outline"
                                    size={size}
                                    onClick={() => handleStateClick(state)}
                                    disabled={disabled || loading || isTransitioning}
                                    className={`gap-2 border-2 hover:${getColorClasses(stateInfo.color).split(' ')[0]} transition-all`}
                                >
                                    {isTransitioning && pendingState === state ? (
                                        <LucideIcons.Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        getIcon(stateInfo.icon)
                                    )}
                                    <span>{labels?.[state] || stateInfo.label}</span>
                                </Button>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            {/* Reason Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {pendingState && getStateInfo(machine, pendingState) && (
                                <>
                                    {getIcon(getStateInfo(machine, pendingState)!.icon)}
                                    Cambiar a: {getStateInfo(machine, pendingState)!.label}
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            Por favor, proporciona una razón para este cambio de estado.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <Textarea
                            placeholder="Escribe la razón del cambio..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={() => pendingState && executeTransition(pendingState, reason)}
                            disabled={isTransitioning}
                        >
                            {isTransitioning ? (
                                <LucideIcons.Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : null}
                            Confirmar Cambio
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

// ============================================================
// SPECIALIZED COMPONENTS
// ============================================================

interface CitaTransitionButtonsProps {
    citaId: string
    currentStatus: CitaStatus
    onTransitionComplete?: (result: { success: boolean }) => void
    requireReason?: boolean
}

export function CitaTransitionButtons({
    citaId,
    currentStatus,
    onTransitionComplete,
    requireReason = false
}: CitaTransitionButtonsProps) {
    const { transitionCita } = useStateMachine()

    const handleTransition = async (targetState: CitaStatus, reason?: string) => {
        const result = await transitionCita(citaId, currentStatus, targetState, { reason })
        onTransitionComplete?.(result)
        return result
    }

    return (
        <StateTransitionButtons
            machine={CITA_STATE_MACHINE}
            currentState={currentStatus}
            entityId={citaId}
            onTransition={handleTransition}
            requireReason={requireReason}
        />
    )
}

interface ConsultaTransitionButtonsProps {
    consultaId: string
    currentStatus: ConsultaStatus
    onTransitionComplete?: (result: { success: boolean }) => void
}

export function ConsultaTransitionButtons({
    consultaId,
    currentStatus,
    onTransitionComplete
}: ConsultaTransitionButtonsProps) {
    const { transitionConsulta } = useStateMachine()

    const handleTransition = async (targetState: ConsultaStatus, reason?: string) => {
        const result = await transitionConsulta(consultaId, currentStatus, targetState, { reason })
        onTransitionComplete?.(result)
        return result
    }

    return (
        <StateTransitionButtons
            machine={CONSULTA_STATE_MACHINE}
            currentState={currentStatus}
            entityId={consultaId}
            onTransition={handleTransition}
        />
    )
}

interface FacturaTransitionButtonsProps {
    facturaId: string
    currentStatus: FacturaStatus
    onTransitionComplete?: (result: { success: boolean }) => void
}

export function FacturaTransitionButtons({
    facturaId,
    currentStatus,
    onTransitionComplete
}: FacturaTransitionButtonsProps) {
    const { transitionFactura } = useStateMachine()

    const handleTransition = async (targetState: FacturaStatus, reason?: string) => {
        const result = await transitionFactura(facturaId, currentStatus, targetState, { reason })
        onTransitionComplete?.(result)
        return result
    }

    return (
        <StateTransitionButtons
            machine={FACTURA_STATE_MACHINE}
            currentState={currentStatus}
            entityId={facturaId}
            onTransition={handleTransition}
        />
    )
}
