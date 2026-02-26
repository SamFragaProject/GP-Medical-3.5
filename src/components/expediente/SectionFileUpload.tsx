/**
 * SectionFileUpload — Componente reutilizable de subida de archivos
 * 
 * Auto-rename: archivos se guardan como {apellido}_{nombre}_{tipo}_{fecha}.{ext}
 * Drag & drop + click to select
 * Modes: compact (inline button) | full (drop zone)
 */
import React, { useState, useRef, useCallback } from 'react'
import { Upload, FileText, X, Loader2, CheckCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

interface SectionFileUploadProps {
    pacienteId: string
    tipoEstudio: string
    pacienteNombre?: string
    onFileUploaded?: (url: string, fileName: string) => void
    onExtractRequested?: (file: File) => void
    compact?: boolean
    accept?: string
}

export default function SectionFileUpload({
    pacienteId, tipoEstudio, pacienteNombre, onFileUploaded, onExtractRequested, compact = false, accept = '.pdf,.jpg,.jpeg,.png,.webp'
}: SectionFileUploadProps) {
    const [isDragging, setIsDragging] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null)
    const fileRef = useRef<HTMLInputElement>(null)

    const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true) }, [])
    const handleDragLeave = useCallback(() => setIsDragging(false), [])
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault(); setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) processFile(file)
    }, [])

    const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) processFile(file)
    }

    const processFile = (file: File) => {
        if (file.size > 20 * 1024 * 1024) { toast.error('El archivo excede 20MB'); return }
        setSelectedFile(file)
    }

    const uploadDirect = async () => {
        if (!selectedFile) return
        setUploading(true)
        try {
            const ext = selectedFile.name.split('.').pop()
            const now = new Date()
            const dateStr = now.toISOString().slice(0, 10)
            const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '')
            const cleanName = (pacienteNombre || pacienteId)
                .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_').slice(0, 60)
            const fileName = `${cleanName}_${tipoEstudio}_${dateStr}_${timeStr}.${ext}`
            const path = `estudios/${pacienteId}/${tipoEstudio}/${fileName}`

            const { error } = await supabase.storage.from('documentos-medicos').upload(path, selectedFile)
            if (error) throw error

            const { data: urlData } = supabase.storage.from('documentos-medicos').getPublicUrl(path)
            onFileUploaded?.(urlData.publicUrl, fileName)
            toast.success('Archivo subido correctamente')
            setSelectedFile(null)
        } catch (err) {
            console.error('Upload error:', err)
            toast.error('Error al subir el archivo')
        }
        setUploading(false)
    }

    const sendToExtract = () => {
        if (!selectedFile || !onExtractRequested) return
        onExtractRequested(selectedFile)
        setSelectedFile(null)
    }

    if (compact) {
        return (
            <div className="flex items-center gap-2">
                <input ref={fileRef} type="file" accept={accept} onChange={handleSelect} className="hidden" />
                <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}
                    className="rounded-xl text-xs font-bold gap-1.5 border-dashed" disabled={uploading}>
                    {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                    Subir Archivo
                </Button>
                {selectedFile && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                        <FileText className="w-3 h-3 text-blue-500" />
                        <span className="text-xs text-blue-700 font-semibold truncate max-w-[120px]">{selectedFile.name}</span>
                        <button onClick={() => setSelectedFile(null)}><X className="w-3 h-3 text-blue-400" /></button>
                        <Button size="sm" onClick={uploadDirect} disabled={uploading} className="h-6 text-[10px] px-2 bg-blue-600 hover:bg-blue-700">
                            {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Guardar'}
                        </Button>
                        {onExtractRequested && (
                            <Button size="sm" variant="outline" onClick={sendToExtract} className="h-6 text-[10px] px-2 gap-1">
                                <Sparkles className="w-3 h-3" /> Extraer IA
                            </Button>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer
                ${isDragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'}
                ${selectedFile ? 'border-emerald-300 bg-emerald-50/50' : ''}`}
            onClick={() => !selectedFile && fileRef.current?.click()}>
            <input ref={fileRef} type="file" accept={accept} onChange={handleSelect} className="hidden" />
            {!selectedFile ? (
                <div className="space-y-1">
                    <Upload className={`w-6 h-6 mx-auto ${isDragging ? 'text-blue-500' : 'text-slate-400'}`} />
                    <p className="text-xs font-semibold text-slate-500">{isDragging ? 'Soltar archivo aquí' : 'Arrastra un archivo o haz clic'}</p>
                    <p className="text-[10px] text-slate-400">PDF, JPG, PNG — máx. 20MB</p>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                        <FileText className="w-5 h-5 text-emerald-500" />
                        <span className="text-sm font-bold text-slate-700 truncate max-w-[200px]">{selectedFile.name}</span>
                        <button onClick={e => { e.stopPropagation(); setSelectedFile(null) }}><X className="w-4 h-4 text-slate-400 hover:text-red-500" /></button>
                    </div>
                    <p className="text-[10px] text-slate-400">{(selectedFile.size / 1024).toFixed(0)} KB</p>
                    <div className="flex items-center justify-center gap-2">
                        <Button size="sm" onClick={e => { e.stopPropagation(); uploadDirect() }} disabled={uploading}
                            className="rounded-xl text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700">
                            {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />} Guardar
                        </Button>
                        {onExtractRequested && (
                            <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); sendToExtract() }}
                                className="rounded-xl text-xs font-bold gap-1.5 border-violet-200 text-violet-700 hover:bg-violet-50">
                                <Sparkles className="w-3 h-3" /> Extraer IA
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
