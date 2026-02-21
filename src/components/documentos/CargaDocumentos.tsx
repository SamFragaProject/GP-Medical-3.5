// =====================================================
// COMPONENTE: Carga de PDF/DICOM — GPMedical ERP Pro
// Upload de documentos clínicos con preview y metadata
// =====================================================

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload, FileText, Image, X, Check, Loader2, Eye,
    Download, Trash2, File, FileImage, AlertCircle, Plus
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export type TipoDocumento = 'pdf' | 'dicom' | 'imagen' | 'laboratorio' | 'receta' | 'consentimiento' | 'otro';

interface DocumentoCargado {
    id: string;
    nombre: string;
    tipo: TipoDocumento;
    tamano: number;
    url: string;
    created_at: string;
    subido_por: string;
    metadata?: Record<string, any>;
}

interface CargaDocumentosProps {
    pacienteId: string;
    episodioId?: string;
    tipoPermitido?: TipoDocumento[];
    onDocumentoCargado?: (doc: DocumentoCargado) => void;
    maxArchivos?: number;
    mostrarLista?: boolean;
}

const TIPO_CONFIG: Record<TipoDocumento, { label: string; icon: React.ElementType; color: string; extensiones: string[] }> = {
    pdf: { label: 'PDF', icon: FileText, color: 'red', extensiones: ['.pdf'] },
    dicom: { label: 'DICOM', icon: FileImage, color: 'purple', extensiones: ['.dcm', '.dicom'] },
    imagen: { label: 'Imagen', icon: Image, color: 'blue', extensiones: ['.jpg', '.jpeg', '.png', '.bmp', '.tiff'] },
    laboratorio: { label: 'Laboratorio', icon: File, color: 'amber', extensiones: ['.pdf', '.jpg', '.png'] },
    receta: { label: 'Receta', icon: FileText, color: 'emerald', extensiones: ['.pdf'] },
    consentimiento: { label: 'Consentimiento', icon: FileText, color: 'cyan', extensiones: ['.pdf', '.jpg', '.png'] },
    otro: { label: 'Otro', icon: File, color: 'gray', extensiones: ['*'] },
};

export default function CargaDocumentos({
    pacienteId,
    episodioId,
    tipoPermitido,
    onDocumentoCargado,
    maxArchivos = 10,
    mostrarLista = true,
}: CargaDocumentosProps) {
    const [archivos, setArchivos] = useState<File[]>([]);
    const [subiendo, setSubiendo] = useState(false);
    const [progreso, setProgreso] = useState<Record<string, number>>({});
    const [documentos, setDocumentos] = useState<DocumentoCargado[]>([]);
    const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoDocumento>('pdf');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loadingDocs, setLoadingDocs] = useState(true);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Cargar documentos existentes
    React.useEffect(() => {
        cargarDocumentos();
    }, [pacienteId]);

    const cargarDocumentos = async () => {
        setLoadingDocs(true);
        let query = supabase
            .from('documentos_clinicos')
            .select('*')
            .eq('paciente_id', pacienteId)
            .order('created_at', { ascending: false });

        if (episodioId) query = query.eq('episodio_id', episodioId);

        const { data } = await query;
        if (data) setDocumentos(data as any);
        setLoadingDocs(false);
    };

    // Detectar tipo de documento por extensión
    const detectarTipo = (fileName: string): TipoDocumento => {
        const ext = '.' + fileName.split('.').pop()?.toLowerCase();
        for (const [tipo, config] of Object.entries(TIPO_CONFIG)) {
            if (config.extensiones.includes(ext)) return tipo as TipoDocumento;
        }
        return 'otro';
    };

    // Seleccionar archivos
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + archivos.length > maxArchivos) {
            toast.error(`Máximo ${maxArchivos} archivos`);
            return;
        }
        setArchivos(prev => [...prev, ...files]);
    };

    // Subir archivo a Supabase Storage
    const subirArchivo = async (file: File): Promise<DocumentoCargado | null> => {
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const path = `documentos/${pacienteId}/${timestamp}_${safeName}`;

        try {
            // Upload to storage
            const { error: uploadError } = await supabase.storage
                .from('documentos-clinicos')
                .upload(path, file, {
                    contentType: file.type,
                    upsert: false,
                });

            if (uploadError) {
                // Si el bucket no existe, crear registro sin storage
                console.warn('Storage error, saving metadata only:', uploadError.message);
            }

            // Obtener URL pública
            const { data: urlData } = supabase.storage
                .from('documentos-clinicos')
                .getPublicUrl(path);

            const tipo = detectarTipo(file.name);

            // Guardar metadata en tabla
            const registro = {
                paciente_id: pacienteId,
                episodio_id: episodioId || null,
                nombre: file.name,
                tipo: tipo,
                tamano: file.size,
                url: urlData?.publicUrl || path,
                mime_type: file.type,
                storage_path: path,
                metadata: {
                    original_name: file.name,
                    size_kb: Math.round(file.size / 1024),
                    uploaded_at: new Date().toISOString()
                }
            };

            const { data, error } = await supabase
                .from('documentos_clinicos')
                .insert(registro)
                .select()
                .single();

            if (error) {
                console.error('Error saving doc metadata:', error);
                return null;
            }

            return data as DocumentoCargado;
        } catch (err: any) {
            console.error('Upload error:', err);
            return null;
        }
    };

    // Subir todos los archivos
    const subirTodos = async () => {
        if (archivos.length === 0) return;
        setSubiendo(true);
        let exitosos = 0;

        for (const file of archivos) {
            setProgreso(prev => ({ ...prev, [file.name]: 0 }));
            const doc = await subirArchivo(file);
            if (doc) {
                exitosos++;
                setDocumentos(prev => [doc, ...prev]);
                onDocumentoCargado?.(doc);
            }
            setProgreso(prev => ({ ...prev, [file.name]: 100 }));
        }

        setSubiendo(false);
        setArchivos([]);
        setProgreso({});

        if (exitosos > 0) toast.success(`${exitosos} documento(s) cargado(s)`);
        if (exitosos < archivos.length) toast.error(`${archivos.length - exitosos} errores`);
    };

    // Eliminar documento
    const eliminarDocumento = async (doc: DocumentoCargado) => {
        const { error } = await supabase
            .from('documentos_clinicos')
            .delete()
            .eq('id', doc.id);

        if (!error) {
            setDocumentos(prev => prev.filter(d => d.id !== doc.id));
            toast.success('Documento eliminado');
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const tiposDisponibles = tipoPermitido || Object.keys(TIPO_CONFIG) as TipoDocumento[];

    return (
        <div className="space-y-4">
            {/* Selector de tipo */}
            <div className="flex flex-wrap gap-2">
                {tiposDisponibles.map(tipo => {
                    const config = TIPO_CONFIG[tipo];
                    return (
                        <button
                            key={tipo}
                            onClick={() => setTipoSeleccionado(tipo)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${tipoSeleccionado === tipo
                                    ? `bg-${config.color}-100 text-${config.color}-700 border-2 border-${config.color}-400`
                                    : 'bg-gray-50 text-gray-500 border-2 border-transparent hover:bg-gray-100'
                                }`}
                        >
                            <config.icon className="w-3.5 h-3.5" />
                            {config.label}
                        </button>
                    );
                })}
            </div>

            {/* Drop zone */}
            <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50/20 transition-all group"
            >
                <Upload className="w-10 h-10 mx-auto text-gray-300 group-hover:text-emerald-500 transition-colors" />
                <p className="mt-3 font-bold text-gray-700 text-sm">Arrastra documentos aquí</p>
                <p className="text-xs text-gray-400 mt-1">PDF, DICOM, Imágenes · Máx {maxArchivos} archivos</p>
            </div>
            <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.dcm,.dicom,.jpg,.jpeg,.png,.bmp,.tiff"
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Archivos seleccionados */}
            <AnimatePresence>
                {archivos.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                    >
                        {archivos.map((file, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
                                    <p className="text-[10px] text-gray-400">{formatSize(file.size)} · {detectarTipo(file.name).toUpperCase()}</p>
                                </div>
                                {progreso[file.name] !== undefined ? (
                                    progreso[file.name] === 100 ? (
                                        <Check className="w-4 h-4 text-emerald-500" />
                                    ) : (
                                        <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                    )
                                ) : (
                                    <button onClick={() => setArchivos(prev => prev.filter((_, idx) => idx !== i))} className="p-1 hover:bg-gray-200 rounded">
                                        <X className="w-4 h-4 text-gray-400" />
                                    </button>
                                )}
                            </div>
                        ))}

                        <button
                            onClick={subirTodos}
                            disabled={subiendo}
                            className="w-full py-2.5 bg-emerald-500 text-white rounded-xl font-bold text-sm hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {subiendo ? <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo...</> : <><Upload className="w-4 h-4" /> Subir {archivos.length} archivo(s)</>}
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Lista de documentos cargados */}
            {mostrarLista && (
                <div className="space-y-2 mt-4">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Documentos ({documentos.length})</h4>
                    {loadingDocs ? (
                        <div className="text-center py-4 text-gray-400 text-sm">Cargando...</div>
                    ) : documentos.length === 0 ? (
                        <div className="text-center py-6 text-gray-300 text-sm">Sin documentos</div>
                    ) : (
                        documentos.map(doc => {
                            const config = TIPO_CONFIG[doc.tipo as TipoDocumento] || TIPO_CONFIG.otro;
                            return (
                                <div key={doc.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-colors group">
                                    <div className={`w-9 h-9 rounded-lg bg-${config.color}-50 flex items-center justify-center`}>
                                        <config.icon className={`w-4 h-4 text-${config.color}-600`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-800 truncate">{doc.nombre}</p>
                                        <p className="text-[10px] text-gray-400">
                                            {config.label} · {formatSize(doc.tamano)} · {new Date(doc.created_at).toLocaleDateString('es-MX')}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {doc.url && (
                                            <a href={doc.url} target="_blank" rel="noopener" className="p-1.5 hover:bg-gray-100 rounded-lg">
                                                <Eye className="w-3.5 h-3.5 text-gray-400" />
                                            </a>
                                        )}
                                        <button onClick={() => eliminarDocumento(doc)} className="p-1.5 hover:bg-red-50 rounded-lg">
                                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
}
