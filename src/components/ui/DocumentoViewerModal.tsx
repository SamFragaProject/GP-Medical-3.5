/**
 * DocumentoViewerModal — Modal Premium para Visualizar, Renombrar y Descargar Documentos
 * 
 * Componente reutilizable que se puede usar desde:
 * - DocumentosExpedienteTab (pestaña de documentos)
 * - Cualquier Tab de expediente (audiometría, laboratorio, etc.)
 * - AnalizadorDocumentos (después de procesar)
 * 
 * Features:
 * - Vista previa de PDF (iframe) e imágenes
 * - Renombrar documento inline
 * - Descargar documento descifrado
 * - Mostrar metadata y estado de integridad
 * - Animaciones premium (framer-motion)
 */

import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X, Download, Eye, Edit3, Check, FileText, FileImage,
    Lock, ShieldCheck, AlertTriangle, Loader2, File,
    Calendar, User, HardDrive, Hash, Maximize2, Minimize2,
    RotateCw, Pencil
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    secureStorageService,
    type DocumentoExpediente,
    type SecureViewResult,
    isViewable,
    isImage as isImageFormat
} from '@/services/secureStorageService'
import { formatFileSize } from '@/services/cryptoService'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

// ── Props ──
interface DocumentoViewerModalProps {
    /** El documento a mostrar (null = cerrado) */
    documento: DocumentoExpediente | null
    /** ID de la empresa para operaciones de descifrado */
    empresaId: string
    /** Callback cuando se cierra */
    onClose: () => void
    /** Callback cuando se renombra exitosamente */
    onRenamed?: (docId: string, nuevoNombre: string) => void
    /** Callback cuando se descarga */
    onDownloaded?: (docId: string) => void
    /** Si true, oculta el botón de renombrar */
    readOnly?: boolean
}

// ── Extensión a icono ──
const EXT_ICONS: Record<string, typeof FileText> = {
    pdf: FileText,
    jpg: FileImage,
    jpeg: FileImage,
    png: FileImage,
    webp: FileImage,
    gif: FileImage,
    docx: FileText,
    pptx: FileText,
    xlsx: FileText,
}

export default function DocumentoViewerModal({
    documento,
    empresaId,
    onClose,
    onRenamed,
    onDownloaded,
    readOnly = false,
}: DocumentoViewerModalProps) {
    const { user } = useAuth()

    // State
    const [viewResult, setViewResult] = useState<SecureViewResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [downloading, setDownloading] = useState(false)
    const [isRenaming, setIsRenaming] = useState(false)
    const [renameValue, setRenameValue] = useState('')
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Load document for viewing when it changes
    useEffect(() => {
        if (!documento) {
            // Cleanup when closing
            if (viewResult) viewResult.cleanup()
            setViewResult(null)
            setError(null)
            setIsRenaming(false)
            return
        }

        if (!isViewable(documento.extension)) {
            setViewResult(null)
            setError(null)
            return
        }

        loadView(documento)

        // Cleanup
        return () => {
            if (viewResult) viewResult.cleanup()
        }
    }, [documento?.id])

    const loadView = async (doc: DocumentoExpediente) => {
        setLoading(true)
        setError(null)
        try {
            const result = await secureStorageService.view(doc, empresaId, user?.id)
            setViewResult(result)
            if (!result.integrityOk) {
                toast.error('⚠️ La integridad del archivo no pudo verificarse', { duration: 5000 })
            }
        } catch (err: any) {
            console.error('Error viewing document:', err)
            setError(err.message || 'Error al descifrar documento')
        } finally {
            setLoading(false)
        }
    }

    // ── Handlers ──
    const handleDownload = async () => {
        if (!documento) return
        setDownloading(true)
        try {
            await secureStorageService.download(documento, empresaId, user?.id)
            toast.success('📥 Documento descargado')
            onDownloaded?.(documento.id)
        } catch (err) {
            toast.error('Error al descargar')
            console.error(err)
        } finally {
            setDownloading(false)
        }
    }

    const handleStartRename = () => {
        if (!documento || readOnly) return
        setRenameValue(documento.nombre_original)
        setIsRenaming(true)
    }

    const handleConfirmRename = async () => {
        if (!documento || !renameValue.trim()) return

        const trimmed = renameValue.trim()
        if (trimmed === documento.nombre_original) {
            setIsRenaming(false)
            return
        }

        try {
            await secureStorageService.rename(documento.id, trimmed, empresaId, user?.id)
            toast.success('✏️ Documento renombrado')
            onRenamed?.(documento.id, trimmed)
            setIsRenaming(false)
        } catch (err) {
            toast.error('Error al renombrar')
            console.error(err)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleConfirmRename()
        if (e.key === 'Escape') setIsRenaming(false)
    }

    if (!documento) return null

    const canView = isViewable(documento.extension)
    const isImg = isImageFormat(documento.extension)
    const IconComponent = EXT_ICONS[documento.extension] || File

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.92, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.92, opacity: 0, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className={`bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${isFullscreen
                            ? 'w-full h-full max-w-full max-h-full rounded-none'
                            : 'max-w-5xl w-full max-h-[92vh]'
                        }`}
                    onClick={e => e.stopPropagation()}
                >
                    {/* ═══════════ HEADER ═══════════ */}
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
                                <IconComponent className="w-5 h-5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                {/* Renombrar inline */}
                                {isRenaming ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            autoFocus
                                            value={renameValue}
                                            onChange={e => setRenameValue(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            className="text-sm font-bold text-slate-800 bg-amber-50 border border-amber-300 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-amber-400 w-full max-w-md"
                                        />
                                        <button
                                            onClick={handleConfirmRename}
                                            className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                                            title="Confirmar"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => setIsRenaming(false)}
                                            className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors"
                                            title="Cancelar"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 group">
                                        <h3 className="font-bold text-sm text-slate-800 truncate">
                                            {documento.nombre_original}
                                        </h3>
                                        {!readOnly && (
                                            <button
                                                onClick={handleStartRename}
                                                className="p-1 rounded-md hover:bg-amber-50 text-slate-400 hover:text-amber-600 opacity-0 group-hover:opacity-100 transition-all"
                                                title="Renombrar"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                )}

                                {/* Meta info */}
                                <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-400 flex-wrap">
                                    <span className="flex items-center gap-1 font-mono uppercase font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                                        {documento.extension}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <HardDrive className="w-3 h-3" />
                                        {formatFileSize(documento.tamano_bytes)}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(documento.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                    {documento.subido_por_nombre && (
                                        <span className="flex items-center gap-1">
                                            <User className="w-3 h-3" />
                                            {documento.subido_por_nombre}
                                        </span>
                                    )}
                                    {viewResult?.integrityOk !== undefined && (
                                        viewResult.integrityOk ? (
                                            <span className="flex items-center gap-1 text-emerald-600">
                                                <ShieldCheck className="w-3 h-3" />
                                                Integridad ✓
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-red-600">
                                                <AlertTriangle className="w-3 h-3" />
                                                Error integridad
                                            </span>
                                        )
                                    )}
                                    {documento.cifrado && (
                                        <span className="flex items-center gap-1 text-emerald-600">
                                            <Lock className="w-3 h-3" />
                                            Cifrado
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Acciones del header */}
                        <div className="flex items-center gap-1.5 ml-4 flex-shrink-0">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={handleDownload}
                                disabled={downloading}
                                className="h-9 px-3 rounded-xl hover:bg-blue-50 hover:text-blue-600 text-slate-500 font-bold text-xs gap-1.5"
                            >
                                {downloading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Download className="w-4 h-4" />
                                )}
                                Descargar
                            </Button>
                            {canView && (
                                <button
                                    onClick={() => setIsFullscreen(!isFullscreen)}
                                    className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                                    title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                                >
                                    {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-red-50 hover:text-red-500 text-slate-400 transition-colors"
                                title="Cerrar"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* ═══════════ CONTENIDO ═══════════ */}
                    <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center min-h-[50vh]">
                        {loading ? (
                            <div className="flex flex-col items-center gap-3 text-slate-500">
                                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                                <p className="text-sm font-medium">Descifrando documento...</p>
                                <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                    <Lock className="w-3 h-3" />
                                    Descifrado local con AES-256-GCM
                                </div>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center gap-3 text-center p-8">
                                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                                    <AlertTriangle className="w-8 h-8 text-red-400" />
                                </div>
                                <p className="text-sm font-bold text-slate-700">Error al cargar documento</p>
                                <p className="text-xs text-slate-500 max-w-sm">{error}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => loadView(documento)}
                                    className="mt-2 gap-2 rounded-xl"
                                >
                                    <RotateCw className="w-4 h-4" /> Reintentar
                                </Button>
                            </div>
                        ) : canView && viewResult ? (
                            // Visor de archivo
                            isImg ? (
                                <div className="p-4 w-full h-full flex items-center justify-center">
                                    <img
                                        src={viewResult.objectUrl}
                                        alt={documento.nombre_original}
                                        className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-xl border border-white/50"
                                    />
                                </div>
                            ) : documento.extension === 'pdf' ? (
                                <iframe
                                    src={viewResult.objectUrl}
                                    title={documento.nombre_original}
                                    className="w-full h-full min-h-[70vh] border-0"
                                />
                            ) : (
                                <div className="text-center py-12 px-8">
                                    <File className="w-16 h-16 mx-auto text-slate-300 mb-4" />
                                    <p className="text-sm text-slate-500 mb-4">
                                        Este formato no tiene vista previa disponible
                                    </p>
                                    <Button
                                        onClick={handleDownload}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl gap-2"
                                    >
                                        <Download className="w-4 h-4" /> Descargar archivo
                                    </Button>
                                </div>
                            )
                        ) : (
                            // No viewable — download only
                            <div className="text-center py-16 px-8">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center">
                                    <IconComponent className="w-12 h-12 text-slate-500" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-700 mb-2">
                                    {documento.nombre_original}
                                </h4>
                                <p className="text-sm text-slate-500 mb-1">
                                    Formato <span className="font-mono font-bold uppercase">{documento.extension}</span> — {formatFileSize(documento.tamano_bytes)}
                                </p>
                                <p className="text-xs text-slate-400 mb-6">
                                    La vista previa no está disponible para este formato. Puedes descargarlo directamente.
                                </p>
                                <Button
                                    onClick={handleDownload}
                                    disabled={downloading}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl gap-2 px-8 py-3 shadow-lg shadow-emerald-500/20"
                                >
                                    {downloading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Download className="w-4 h-4" />
                                    )}
                                    Descargar Documento
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* ═══════════ FOOTER ═══════════ */}
                    {documento.descripcion && (
                        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">Descripción</p>
                            <p className="text-xs text-slate-600">{documento.descripcion}</p>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
