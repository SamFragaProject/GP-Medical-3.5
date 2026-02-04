import React, { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Pen, Eraser, Check, X, RotateCcw, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SignaturePadProps {
    onSave: (signatureDataUrl: string) => void
    onCancel?: () => void
    width?: number
    height?: number
    penColor?: string
    backgroundColor?: string
    label?: string
}

export function SignaturePad({
    onSave,
    onCancel,
    width = 400,
    height = 200,
    penColor = '#1e293b',
    backgroundColor = '#ffffff',
    label = 'Firma Digital'
}: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    const [hasSignature, setHasSignature] = useState(false)
    const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const context = canvas.getContext('2d')
        if (!context) return

        // Set up canvas
        context.fillStyle = backgroundColor
        context.fillRect(0, 0, width, height)
        context.strokeStyle = penColor
        context.lineWidth = 2
        context.lineCap = 'round'
        context.lineJoin = 'round'
        setCtx(context)
    }, [width, height, penColor, backgroundColor])

    const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }

        const rect = canvas.getBoundingClientRect()
        const scaleX = canvas.width / rect.width
        const scaleY = canvas.height / rect.height

        if ('touches' in e) {
            return {
                x: (e.touches[0].clientX - rect.left) * scaleX,
                y: (e.touches[0].clientY - rect.top) * scaleY
            }
        }

        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        }
    }

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        if (!ctx) return
        const { x, y } = getCoordinates(e)
        ctx.beginPath()
        ctx.moveTo(x, y)
        setIsDrawing(true)
    }

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !ctx) return
        const { x, y } = getCoordinates(e)
        ctx.lineTo(x, y)
        ctx.stroke()
        setHasSignature(true)
    }

    const stopDrawing = () => {
        if (!ctx) return
        ctx.closePath()
        setIsDrawing(false)
    }

    const clearSignature = () => {
        if (!ctx) return
        ctx.fillStyle = backgroundColor
        ctx.fillRect(0, 0, width, height)
        ctx.strokeStyle = penColor
        setHasSignature(false)
    }

    const saveSignature = () => {
        const canvas = canvasRef.current
        if (!canvas || !hasSignature) return
        const dataUrl = canvas.toDataURL('image/png')
        onSave(dataUrl)
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <Pen className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-slate-800">{label}</span>
                </div>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={clearSignature}
                        className="rounded-full"
                    >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Limpiar
                    </Button>
                </div>
            </div>

            {/* Canvas Container */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-slate-200 bg-white shadow-inner">
                <canvas
                    ref={canvasRef}
                    width={width}
                    height={height}
                    className="w-full touch-none cursor-crosshair"
                    style={{ maxWidth: '100%', height: 'auto' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />

                {/* Placeholder text */}
                {!hasSignature && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <p className="text-slate-300 text-sm font-medium">Firme aquí</p>
                    </div>
                )}

                {/* Guide line */}
                <div
                    className="absolute bottom-8 left-8 right-8 border-b border-slate-200 pointer-events-none"
                    style={{ borderStyle: 'dashed' }}
                />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
                {onCancel && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onCancel}
                        className="rounded-full"
                    >
                        <X className="w-4 h-4 mr-2" />
                        Cancelar
                    </Button>
                )}
                <Button
                    type="button"
                    onClick={saveSignature}
                    disabled={!hasSignature}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full disabled:opacity-50"
                >
                    <Check className="w-4 h-4 mr-2" />
                    Guardar Firma
                </Button>
            </div>
        </motion.div>
    )
}

// Componente de visualización de firma guardada
interface SignatureDisplayProps {
    signatureUrl: string
    label?: string
    onRemove?: () => void
    size?: 'sm' | 'md' | 'lg'
}

export function SignatureDisplay({
    signatureUrl,
    label = 'Firma',
    onRemove,
    size = 'md'
}: SignatureDisplayProps) {
    const sizeClasses = {
        sm: 'h-12 max-w-[100px]',
        md: 'h-16 max-w-[150px]',
        lg: 'h-20 max-w-[200px]'
    }

    return (
        <div className="text-center space-y-2">
            <div className="flex items-center justify-center">
                <img
                    src={signatureUrl}
                    alt={label}
                    className={`${sizeClasses[size]} object-contain`}
                />
            </div>
            <p className="text-xs text-slate-500 font-medium">{label}</p>
            {onRemove && (
                <button
                    onClick={onRemove}
                    className="text-xs text-red-500 hover:text-red-700 underline"
                >
                    Eliminar firma
                </button>
            )}
        </div>
    )
}

// Modal/Dialog para captura de firma
interface SignatureModalProps {
    open: boolean
    onClose: () => void
    onSave: (signatureDataUrl: string) => void
    title?: string
}

export function SignatureModal({
    open,
    onClose,
    onSave,
    title = 'Capturar Firma Digital'
}: SignatureModalProps) {
    if (!open) return null

    const handleSave = (dataUrl: string) => {
        onSave(dataUrl)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative z-10 bg-white rounded-3xl shadow-2xl p-6 max-w-lg w-full mx-4"
            >
                <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Pen className="w-5 h-5 text-indigo-500" />
                    {title}
                </h2>

                <SignaturePad
                    onSave={handleSave}
                    onCancel={onClose}
                />
            </motion.div>
        </div>
    )
}
