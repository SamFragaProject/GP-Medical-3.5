import * as React from "react"
import { Modal } from "./modal"
import { Button } from "./button"
import { AlertTriangle } from "lucide-react"

interface ConfirmDialogProps {
    open: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'danger' | 'warning' | 'info'
}

export function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger'
}: ConfirmDialogProps) {
    const variantColors = {
        danger: 'bg-red-600 hover:bg-red-700',
        warning: 'bg-amber-600 hover:bg-amber-700',
        info: 'bg-blue-600 hover:bg-blue-700'
    }

    const handleConfirm = () => {
        onConfirm()
        onClose()
    }

    return (
        <Modal open={open} onClose={onClose} title={title} size="sm">
            <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${variant === 'danger' ? 'bg-red-100' : variant === 'warning' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                        <AlertTriangle className={`w-6 h-6 ${variant === 'danger' ? 'text-red-600' : variant === 'warning' ? 'text-amber-600' : 'text-blue-600'}`} />
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed pt-2">{message}</p>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
                    <Button variant="outline" onClick={onClose}>
                        {cancelText}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className={`text-white ${variantColors[variant]}`}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
