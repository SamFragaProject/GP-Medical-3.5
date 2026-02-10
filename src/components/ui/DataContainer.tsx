import React, { ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, AlertCircle, Inbox, RefreshCw, Plus } from 'lucide-react'
import { Button } from './button'
import { PremiumCard } from './PremiumCard'

interface DataContainerProps {
    loading: boolean
    error: string | null
    data: any | any[] | null | undefined
    children: ReactNode
    onRetry?: () => void
    emptyMessage?: string
    emptyTitle?: string
    emptyAction?: () => void
    emptyActionLabel?: string
    loadingMessage?: string
    hideEmpty?: boolean
    className?: string
}

export function DataContainer({
    loading,
    error,
    data,
    children,
    onRetry,
    emptyMessage = "No se encontraron registros en este momento.",
    emptyTitle = "Sin Información",
    emptyAction,
    emptyActionLabel = "Agregar Registro",
    loadingMessage = "Sincronizando con el Intelligence Bureau...",
    hideEmpty = false,
    className = ""
}: DataContainerProps) {

    // Determinamos el estado actual
    const isArray = Array.isArray(data)
    const isEmpty = !loading && !error && !hideEmpty && (!data || (isArray && data.length === 0))
    const hasError = !loading && !!error
    const hasData = !loading && !error && data && (!isArray || data.length > 0)

    return (
        <div className={`relative min-h-[400px] w-full ${className}`}>
            <AnimatePresence mode="wait">

                {/* Loading State */}
                {loading && (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/50 backdrop-blur-[2px] rounded-3xl"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl animate-pulse" />
                            <Loader2 className="w-12 h-12 text-blue-600 animate-spin relative z-10" />
                        </div>
                        <p className="mt-4 text-slate-600 font-bold text-sm animate-pulse">
                            {loadingMessage}
                        </p>
                    </motion.div>
                )}

                {/* Error State */}
                {hasError && (
                    <motion.div
                        key="error"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col items-center justify-center p-12 text-center"
                    >
                        <PremiumCard variant="gradient" gradient="rose" className="max-w-md p-8 border-rose-100">
                            <div className="w-16 h-16 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <AlertCircle className="w-8 h-8 text-rose-600" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-2">Error de Conexión</h3>
                            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                                {error || "Hubo un problema al intentar recuperar los datos. Por favor, verifica tu conexión o intenta de nuevo."}
                            </p>
                            {onRetry && (
                                <Button
                                    onClick={onRetry}
                                    className="bg-rose-600 hover:bg-rose-700 text-white font-black uppercase text-[10px] tracking-widest h-11 px-8 rounded-xl"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" /> Reintentar Conexión
                                </Button>
                            )}
                        </PremiumCard>
                    </motion.div>
                )}

                {/* Empty State */}
                {isEmpty && (
                    <motion.div
                        key="empty"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="flex flex-col items-center justify-center p-12 text-center"
                    >
                        <div className="w-20 h-20 bg-slate-100 rounded-3xl flex items-center justify-center mb-6">
                            <Inbox className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-2">{emptyTitle}</h3>
                        <p className="text-slate-500 text-sm max-w-xs mx-auto leading-relaxed mb-6">
                            {emptyMessage}
                        </p>
                        {emptyAction && (
                            <Button
                                onClick={emptyAction}
                                className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl"
                            >
                                <Plus className="w-4 h-4 mr-2" /> {emptyActionLabel}
                            </Button>
                        )}
                    </motion.div>
                )}

                {/* Success State */}
                {hasData && (
                    <motion.div
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="h-full"
                    >
                        {children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
