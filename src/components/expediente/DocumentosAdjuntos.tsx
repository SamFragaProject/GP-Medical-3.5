/**
 * DocumentosAdjuntos — Panel reutilizable de documentos adjuntos por categoría
 * 
 * Se integra en cualquier Tab del expediente para mostrar documentos relacionados.
 * Ejemplo de uso en AudiometriaTab:
 * 
 *   <DocumentosAdjuntos
 *     pacienteId={pacienteId}
 *     empresaId={empresaId}
 *     categoria="audiometria"
 *     titulo="Documentos de Audiometría"
 *   />
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileText, FileImage, File, Download, Eye, Paperclip,
    ChevronDown, ChevronUp, Loader2, FolderOpen
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useDocumentosPaciente } from '@/hooks/useDocumentosPaciente'
import { type DocumentoExpediente, isViewable } from '@/services/secureStorageService'
import { formatFileSize } from '@/services/cryptoService'
import { useAuth } from '@/contexts/AuthContext'
import DocumentoViewerModal from '@/components/ui/DocumentoViewerModal'
import { EMPRESA_PRINCIPAL_ID } from '@/config/empresa'

// ── Props ──
interface DocumentosAdjuntosProps {
    pacienteId: string
    empresaId?: string
    categoria: string
    titulo?: string
    /** Si true, se muestra colapsado por defecto */
    collapsedByDefault?: boolean
}

// ── Icon map ──
const EXT_ICONS: Record<string, typeof FileText> = {
    pdf: FileText,
    jpg: FileImage,
    jpeg: FileImage,
    png: FileImage,
    webp: FileImage,
    gif: FileImage,
}

export default function DocumentosAdjuntos({
    pacienteId,
    empresaId: empresaIdProp,
    categoria,
    titulo = 'Documentos Adjuntos',
    collapsedByDefault = true,
}: DocumentosAdjuntosProps) {
    const { user } = useAuth()
    const resolvedEmpresaId = empresaIdProp || user?.empresa_id || EMPRESA_PRINCIPAL_ID
    const { documentos, loading, refresh, totalCount } = useDocumentosPaciente(pacienteId, categoria)
    const [collapsed, setCollapsed] = useState(collapsedByDefault)
    const [selectedDoc, setSelectedDoc] = useState<DocumentoExpediente | null>(null)

    // No renderizar si no hay documentos y no está cargando
    if (!loading && totalCount === 0) return null

    return (
        <>
            <div className="mt-4">
                {/* ── Header colapsable ── */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white/5 border-white/10 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/30 transition-all group"
                >
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center group-hover:from-emerald-100 group-hover:to-teal-100 transition-colors">
                            <Paperclip className="w-4 h-4 text-emerald-600" />
                        </div>
                        <span className="text-xs font-black text-slate-700 uppercase tracking-wider">
                            {titulo}
                        </span>
                        {totalCount > 0 && (
                            <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[9px] font-black px-2 py-0.5">
                                {totalCount}
                            </Badge>
                        )}
                    </div>
                    {collapsed ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                    )}
                </button>

                {/* ── Lista de documentos ── */}
                <AnimatePresence>
                    {!collapsed && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-2 space-y-1.5">
                                {loading ? (
                                    <div className="flex items-center gap-2 px-4 py-4 text-slate-400 text-xs">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Cargando documentos...
                                    </div>
                                ) : (
                                    documentos.map((doc) => {
                                        const Icon = EXT_ICONS[doc.extension] || File
                                        const canView = isViewable(doc.extension)

                                        return (
                                            <motion.div
                                                key={doc.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white border border-white/10 hover:border-white/30 hover:shadow-sm transition-all group cursor-pointer"
                                                onClick={() => setSelectedDoc(doc)}
                                            >
                                                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                                                    <Icon className="w-4.5 h-4.5 text-slate-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-slate-700 truncate">
                                                        {doc.nombre_original}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-400">
                                                        <span>{formatFileSize(doc.tamano_bytes)}</span>
                                                        <span>•</span>
                                                        <span>{new Date(doc.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {canView && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setSelectedDoc(doc) }}
                                                            className="p-1.5 rounded-lg hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 transition-colors"
                                                            title="Ver"
                                                        >
                                                            <Eye className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )
                                    })
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* ── Modal Viewer ── */}
            <DocumentoViewerModal
                documento={selectedDoc}
                empresaId={resolvedEmpresaId}
                onClose={() => setSelectedDoc(null)}
                onRenamed={(id, nuevoNombre) => {
                    refresh()
                    setSelectedDoc(null)
                }}
            />
        </>
    )
}
