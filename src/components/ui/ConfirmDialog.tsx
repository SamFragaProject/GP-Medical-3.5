import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, HelpCircle, Info, X } from 'lucide-react'
import { Button } from './button'

interface ConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    description: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'warning' | 'info'
    isLoading?: boolean
}

export function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    variant = 'danger',
    isLoading = false
}: ConfirmDialogProps) {

    const variants = {
        danger: {
            icon: AlertCircle,
            iconClass: "text-red-600 bg-red-100",
            buttonClass: "bg-red-600 hover:bg-red-700 text-white",
            titleClass: "text-red-900"
        },
        warning: {
            icon: HelpCircle,
            iconClass: "text-amber-600 bg-amber-100",
            buttonClass: "bg-amber-600 hover:bg-amber-700 text-white",
            titleClass: "text-amber-900"
        },
        info: {
            icon: Info,
            iconClass: "text-blue-600 bg-blue-100",
            buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
            titleClass: "text-blue-900"
        }
    }

    const activeVariant = variants[variant]
    const Icon = activeVariant.icon

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100"
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-2xl ${activeVariant.iconClass}`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <h3 className={`text-xl font-black mb-2 ${activeVariant.titleClass}`}>
                                {title}
                            </h3>
                            <p className="text-slate-600 text-sm leading-relaxed mb-8">
                                {description}
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    className="flex-1 rounded-xl h-12 font-bold text-slate-600 border-slate-200"
                                >
                                    {cancelText}
                                </Button>
                                <Button
                                    onClick={onConfirm}
                                    disabled={isLoading}
                                    className={`flex-1 rounded-xl h-12 font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all ${activeVariant.buttonClass}`}
                                >
                                    {isLoading ? "Procesando..." : confirmText}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
