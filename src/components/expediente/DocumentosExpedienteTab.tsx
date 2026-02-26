/**
 * DocumentosExpedienteTab — Gestión Segura de Documentos del Paciente
 * 
 * Componente que permite subir, visualizar y descargar documentos
 * médicos con cifrado end-to-end y auditoría completa.
 * 
 * Formatos soportados:
 *   📄 PDF  → Vista embebida
 *   🖼️ JPG/PNG → Vista directa
 *   📊 PPTX → Descarga
 *   📝 DOCX → Descarga
 */

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Upload, FileText, Image, File, Download, Eye,
    Trash2, Shield, Lock, CheckCircle, AlertTriangle,
    Search, Filter, Clock, User, FolderOpen,
    X, Loader2, ShieldCheck, FileWarning,
    FileSpreadsheet, Presentation, FileImage,
    Activity, ChevronDown
} from 'lucide-react'
import DocumentoViewerModal from '@/components/ui/DocumentoViewerModal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import toast from 'react-hot-toast'
import {
    secureStorageService,
    type DocumentoExpediente,
    type SecureViewResult,
    isViewable,
    isImage
} from '@/services/secureStorageService'
import { formatFileSize, detectCategoria } from '@/services/cryptoService'
import { useAuth } from '@/contexts/AuthContext'

// ============================================
// TIPOS & CONSTANTES
// ============================================

interface Props {
    pacienteId: string
    empresaId: string
    pacienteNombre?: string
}

const CATEGORIAS = [
    { key: 'historia_clinica', label: 'Historia Clínica', icon: FileText, color: 'bg-blue-500' },
    { key: 'audiometria', label: 'Audiometría', icon: Activity, color: 'bg-purple-500' },
    { key: 'espirometria', label: 'Espirometría', icon: Activity, color: 'bg-teal-500' },
    { key: 'laboratorio', label: 'Laboratorio', icon: FileSpreadsheet, color: 'bg-green-500' },
    { key: 'radiografia', label: 'Radiografía', icon: FileImage, color: 'bg-amber-500' },
    { key: 'electrocardiograma', label: 'Electrocardiograma', icon: Activity, color: 'bg-red-500' },
    { key: 'certificado_aptitud', label: 'Certificado Aptitud', icon: ShieldCheck, color: 'bg-emerald-500' },
    { key: 'dictamen', label: 'Dictamen', icon: FileText, color: 'bg-indigo-500' },
    { key: 'receta', label: 'Receta', icon: FileText, color: 'bg-pink-500' },
    { key: 'incapacidad', label: 'Incapacidad', icon: FileWarning, color: 'bg-orange-500' },
    { key: 'consentimiento', label: 'Consentimiento', icon: ShieldCheck, color: 'bg-cyan-500' },
    { key: 'identificacion', label: 'Identificación', icon: User, color: 'bg-slate-500' },
    { key: 'otro', label: 'Otro', icon: File, color: 'bg-gray-500' },
]

const EXTENSION_ICONS: Record<string, typeof FileText> = {
    pdf: FileText,
    jpg: FileImage,
    jpeg: FileImage,
    png: FileImage,
    webp: FileImage,
    pptx: Presentation,
    docx: FileSpreadsheet,
    xlsx: FileSpreadsheet,
}

const ACCEPTED_FORMATS = '.pdf,.jpg,.jpeg,.png,.webp,.docx,.pptx,.xlsx,.xls,.ppt,.doc,.gif'

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export default function DocumentosExpedienteTab({ pacienteId, empresaId, pacienteNombre }: Props) {
    const { user } = useAuth()
    const fileInputRef = useRef<HTMLInputElement>(null)

    // State
    const [documentos, setDocumentos] = useState<DocumentoExpediente[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState<string>('')
    const [searchQuery, setSearchQuery] = useState('')
    const [filtroCategoria, setFiltroCategoria] = useState<string>('all')
    const [viewingDoc, setViewingDoc] = useState<SecureViewResult | null>(null)
    const [selectedDocForViewer, setSelectedDocForViewer] = useState<DocumentoExpediente | null>(null)
    const [showUploadZone, setShowUploadZone] = useState(false)
    const [selectedCategoria, setSelectedCategoria] = useState<string>('')
    const [descripcion, setDescripcion] = useState('')
    const [dragOver, setDragOver] = useState(false)

    // Cargar documentos
    const loadDocumentos = useCallback(async () => {
        setLoading(true)
        try {
            let docs = await secureStorageService.getByPaciente(pacienteId)

            // DEMO FALLBACK
            if (docs.length === 0 && pacienteId?.startsWith('demo')) {
                docs = [
                    {
                        id: 'demo-doc-1',
                        paciente_id: pacienteId,
                        empresa_id: empresaId,
                        nombre_original: 'Consentimiento_Informado_Firmado.pdf',
                        nombre_archivo: 'demo-file',
                        extension: 'pdf',
                        tamano_bytes: 1048576 * 1.5, // 1.5MB
                        categoria: 'consentimiento',
                        descripcion: 'Consentimiento informado firmado digitalmente por el trabajador',
                        creado_por_id: 'demo-usr',
                        creado_por_nombre: 'Dra. Patricia Góngora',
                        creado_por_rol: 'medico',
                        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
                        hash_sha256: 'a1b2c3d4e5f6',
                        metadata: {}
                    },
                    {
                        id: 'demo-doc-2',
                        paciente_id: pacienteId,
                        empresa_id: empresaId,
                        nombre_original: 'Radiografia_Torax_PA.jpg',
                        nombre_archivo: 'demo-file-2',
                        extension: 'jpg',
                        tamano_bytes: 1048576 * 4.2, // 4.2MB
                        categoria: 'radiografia',
                        descripcion: 'Rx Tórax Posterior-Anterior. Sin hallazgos patológicos.',
                        creado_por_id: 'demo-usr',
                        creado_por_nombre: 'Téc. Rx Juan Pérez',
                        creado_por_rol: 'laboratorista',
                        created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
                        hash_sha256: 'f6e5d4c3b2a1',
                        metadata: {}
                    }
                ] as unknown as DocumentoExpediente[];
            }

            setDocumentos(docs)
        } catch (err) {
            console.error('Error cargando documentos:', err)
        } finally {
            setLoading(false)
        }
    }, [pacienteId])

    useEffect(() => {
        loadDocumentos()
    }, [loadDocumentos])

    // Cleanup viewer on unmount
    useEffect(() => {
        return () => {
            if (viewingDoc) viewingDoc.cleanup()
        }
    }, [viewingDoc])

    // ---- HANDLERS ----

    const handleFileSelect = async (files: FileList | null) => {
        if (!files || files.length === 0) return

        setUploading(true)
        let uploaded = 0
        let errors = 0

        for (let i = 0; i < files.length; i++) {
            const file = files[i]
            setUploadProgress(`Cifrando y subiendo ${i + 1} de ${files.length}: ${file.name}...`)

            try {
                await secureStorageService.upload(file, {
                    pacienteId,
                    empresaId,
                    categoria: selectedCategoria || detectCategoria(file.name),
                    descripcion: descripcion || undefined,
                    userId: user?.id,
                    userNombre: user?.nombre ? `${user.nombre} ${user.apellido_paterno || ''}` : undefined,
                    userRol: user?.rol,
                })
                uploaded++
            } catch (err: any) {
                console.error(`Error subiendo ${file.name}:`, err)
                errors++
            }
        }

        setUploading(false)
        setUploadProgress('')
        setShowUploadZone(false)
        setSelectedCategoria('')
        setDescripcion('')

        if (uploaded > 0) {
            toast.success(
                `🔐 ${uploaded} documento${uploaded > 1 ? 's' : ''} cifrado${uploaded > 1 ? 's' : ''} y almacenado${uploaded > 1 ? 's' : ''} de forma segura`,
                { duration: 4000 }
            )
        }
        if (errors > 0) {
            toast.error(`${errors} archivo${errors > 1 ? 's' : ''} no se pudieron subir`)
        }

        loadDocumentos()
    }

    const handleView = async (doc: DocumentoExpediente) => {
        if (!isViewable(doc.extension)) {
            // Para formatos no visualizables, descargar directamente
            handleDownload(doc)
            return
        }

        try {
            toast.loading('Descifrando documento...', { id: 'decrypt' })
            const result = await secureStorageService.view(doc, empresaId, user?.id)
            toast.dismiss('decrypt')

            if (!result.integrityOk) {
                toast.error('⚠️ ALERTA: La integridad del archivo no pudo verificarse', { duration: 6000 })
            }

            setViewingDoc(result)
        } catch (err) {
            toast.dismiss('decrypt')
            toast.error('Error al descifrar documento')
            console.error(err)
        }
    }

    const handleDownload = async (doc: DocumentoExpediente) => {
        try {
            toast.loading('Descifrando para descarga...', { id: 'download' })
            await secureStorageService.download(doc, empresaId, user?.id)
            toast.dismiss('download')
            toast.success('📥 Documento descargado')
        } catch (err) {
            toast.dismiss('download')
            toast.error('Error al descargar')
            console.error(err)
        }
    }

    const handleDelete = async (doc: DocumentoExpediente) => {
        if (!confirm(`¿Eliminar "${doc.nombre_original}"? Esta acción quedará registrada en auditoría.`)) return

        try {
            await secureStorageService.delete(doc.id, empresaId, user?.id)
            toast.success('Documento eliminado')
            loadDocumentos()
        } catch (err) {
            toast.error('Error al eliminar')
        }
    }

    // Drag & Drop
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(true)
    }
    const handleDragLeave = () => setDragOver(false)
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        handleFileSelect(e.dataTransfer.files)
    }

    // Filtros
    const docsFiltrados = documentos.filter(d => {
        if (filtroCategoria !== 'all' && d.categoria !== filtroCategoria) return false
        if (searchQuery) {
            const q = searchQuery.toLowerCase()
            return d.nombre_original.toLowerCase().includes(q) || d.categoria.toLowerCase().includes(q)
        }
        return true
    })

    // Stats por categoría
    const statsCategorias = CATEGORIAS.map(cat => ({
        ...cat,
        count: documentos.filter(d => d.categoria === cat.key).length
    })).filter(c => c.count > 0)

    // ============================================
    // RENDER
    // ============================================

    return (
        <div className="space-y-6">

            {/* Header con seguridad */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <FolderOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-800">Documentos del Expediente</h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Shield className="w-3 h-3 text-emerald-500" />
                            <span>Cifrado AES-256-GCM • SHA-256 • Auditoría completa</span>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={() => setShowUploadZone(!showUploadZone)}
                    className="h-10 px-5 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 font-bold text-xs gap-2 shadow-lg shadow-emerald-500/20"
                >
                    <Upload className="w-4 h-4" />
                    Subir Documento
                </Button>
            </div>

            {/* Badges de seguridad */}
            <div className="flex flex-wrap gap-2">
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 gap-1">
                    <Lock className="w-3 h-3" /> Cifrado End-to-End
                </Badge>
                <Badge className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
                    <ShieldCheck className="w-3 h-3" /> Integridad SHA-256
                </Badge>
                <Badge className="bg-purple-50 text-purple-700 border-purple-200 gap-1">
                    <Activity className="w-3 h-3" /> Auditoría Activa
                </Badge>
                <Badge className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
                    <Clock className="w-3 h-3" /> URLs Temporales
                </Badge>
            </div>

            {/* Zona de Upload */}
            <AnimatePresence>
                {showUploadZone && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                    >
                        <Card className={`border-2 border-dashed transition-colors ${dragOver ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50'
                            }`}>
                            <CardContent
                                className="p-8 text-center"
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                            >
                                {uploading ? (
                                    <div className="space-y-3">
                                        <Loader2 className="w-12 h-12 mx-auto text-emerald-500 animate-spin" />
                                        <p className="text-sm font-bold text-slate-700">{uploadProgress}</p>
                                        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                                            <Lock className="w-3 h-3" />
                                            <span>Cifrando con AES-256-GCM antes de enviar al servidor...</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                                            <Upload className="w-8 h-8 text-emerald-600" />
                                        </div>

                                        <p className="font-bold text-slate-700 mb-1">
                                            Arrastra archivos aquí o haz clic para seleccionar
                                        </p>
                                        <p className="text-xs text-slate-500 mb-4">
                                            PDF, JPG, PNG, DOCX, PPTX, XLSX — Máx 50MB por archivo
                                        </p>

                                        {/* Categoría selector */}
                                        <div className="flex flex-wrap gap-2 justify-center mb-4">
                                            {CATEGORIAS.slice(0, 8).map(cat => (
                                                <button
                                                    key={cat.key}
                                                    onClick={() => setSelectedCategoria(
                                                        selectedCategoria === cat.key ? '' : cat.key
                                                    )}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedCategoria === cat.key
                                                        ? 'bg-emerald-500 text-white shadow-md'
                                                        : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'
                                                        }`}
                                                >
                                                    {cat.label}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Descripción opcional */}
                                        <Input
                                            placeholder="Descripción opcional del documento..."
                                            value={descripcion}
                                            onChange={e => setDescripcion(e.target.value)}
                                            className="max-w-md mx-auto mb-4 text-sm"
                                        />

                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept={ACCEPTED_FORMATS}
                                            multiple
                                            onChange={e => handleFileSelect(e.target.files)}
                                            className="hidden"
                                        />

                                        <Button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl px-6 gap-2"
                                        >
                                            <FolderOpen className="w-4 h-4" />
                                            Seleccionar Archivos
                                        </Button>

                                        <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-slate-400">
                                            <Shield className="w-3 h-3" />
                                            Los archivos se cifran en tu navegador antes de enviarse al servidor
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats por categoría */}
            {statsCategorias.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setFiltroCategoria('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filtroCategoria === 'all'
                            ? 'bg-slate-800 text-white'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        Todos ({documentos.length})
                    </button>
                    {statsCategorias.map(cat => (
                        <button
                            key={cat.key}
                            onClick={() => setFiltroCategoria(
                                filtroCategoria === cat.key ? 'all' : cat.key
                            )}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${filtroCategoria === cat.key
                                ? 'bg-emerald-500 text-white shadow-md'
                                : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300'
                                }`}
                        >
                            <div className={`w-2 h-2 rounded-full ${cat.color}`} />
                            {cat.label} ({cat.count})
                        </button>
                    ))}
                </div>
            )}

            {/* Búsqueda */}
            {documentos.length > 0 && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Buscar documentos..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="pl-10 bg-slate-50 border-slate-200 rounded-xl"
                    />
                </div>
            )}

            {/* Lista de documentos */}
            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                    <span className="ml-2 text-slate-500">Cargando documentos...</span>
                </div>
            ) : docsFiltrados.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                        <FolderOpen className="w-10 h-10 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-2">
                        {searchQuery ? 'Sin resultados' : 'Sin documentos'}
                    </h3>
                    <p className="text-sm text-slate-500 mb-4 max-w-md mx-auto">
                        {searchQuery
                            ? `No se encontraron documentos para "${searchQuery}"`
                            : 'Sube documentos médicos para almacenarlos de forma segura con cifrado end-to-end'}
                    </p>
                    {!searchQuery && (
                        <Button
                            onClick={() => setShowUploadZone(true)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl gap-2"
                        >
                            <Upload className="w-4 h-4" /> Subir primer documento
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-2">
                    {docsFiltrados.map((doc, idx) => {
                        const catInfo = CATEGORIAS.find(c => c.key === doc.categoria) || CATEGORIAS[CATEGORIAS.length - 1]
                        const IconComponent = EXTENSION_ICONS[doc.extension] || File
                        const canView = isViewable(doc.extension)

                        return (
                            <motion.div
                                key={doc.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                            >
                                <Card className="border border-slate-100 hover:border-emerald-200 hover:shadow-md transition-all group">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-4">

                                            {/* Icono del archivo */}
                                            <div className={`w-12 h-12 rounded-xl ${catInfo.color} bg-opacity-10 flex items-center justify-center flex-shrink-0`}>
                                                <IconComponent className={`w-6 h-6`} style={{ color: catInfo.color.replace('bg-', '').includes('500') ? undefined : undefined }} />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-sm text-slate-800 truncate">
                                                    {doc.nombre_original}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <Badge variant="outline" className="text-[9px] gap-1 px-1.5 py-0 h-5">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${catInfo.color}`} />
                                                        {catInfo.label}
                                                    </Badge>
                                                    <span className="text-[10px] text-slate-400">
                                                        {formatFileSize(doc.tamano_bytes)}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        {doc.extension.toUpperCase()}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400">
                                                        {new Date(doc.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                </div>
                                                {doc.descripcion && (
                                                    <p className="text-xs text-slate-500 mt-1 truncate">{doc.descripcion}</p>
                                                )}
                                            </div>

                                            {/* Seguridad indicator */}
                                            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 border border-emerald-100">
                                                <Lock className="w-3 h-3 text-emerald-600" />
                                                <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider">
                                                    Cifrado
                                                </span>
                                            </div>

                                            {/* Acciones */}
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 rounded-lg hover:bg-emerald-50 hover:text-emerald-600"
                                                    onClick={() => setSelectedDocForViewer(doc)}
                                                    title="Ver / Renombrar / Descargar"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 rounded-lg hover:bg-blue-50 hover:text-blue-600"
                                                    onClick={() => handleDownload(doc)}
                                                    title="Descargar"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 w-8 p-0 rounded-lg hover:bg-red-50 hover:text-red-600"
                                                    onClick={() => handleDelete(doc)}
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            {/* Modal Viewer con Renombrar y Descargar */}
            <DocumentoViewerModal
                documento={selectedDocForViewer}
                empresaId={empresaId}
                onClose={() => setSelectedDocForViewer(null)}
                onRenamed={(id, nuevoNombre) => {
                    setDocumentos(prev => prev.map(d =>
                        d.id === id ? { ...d, nombre_original: nuevoNombre } : d
                    ))
                    setSelectedDocForViewer(null)
                }}
            />
        </div>
    )
}
