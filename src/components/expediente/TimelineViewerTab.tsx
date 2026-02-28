import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, FileText, Calendar, FileUp } from 'lucide-react';
import { getTimelineByPaciente, DocumentoExpedienteAbierto } from '@/services/documentService';
import DynamicDataViewer from '@/components/ui/DynamicDataViewer';

export default function TimelineViewerTab({ pacienteId }: { pacienteId: string }) {
    const [documentos, setDocumentos] = useState<DocumentoExpedienteAbierto[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState<DocumentoExpedienteAbierto | null>(null);

    useEffect(() => {
        loadDocs();
    }, [pacienteId]);

    const loadDocs = async () => {
        setLoading(true);
        try {
            const docs = await getTimelineByPaciente(pacienteId);
            setDocumentos(docs);
            if (docs.length > 0) setSelectedDoc(docs[0]);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;

    if (documentos.length === 0) return (
        <div className="text-center p-12 bg-white rounded-2xl shadow-sm border border-slate-100">
            <FileUp className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-700">Sin historial cronológico</h3>
            <p className="text-slate-500 max-w-sm mx-auto mt-2">No se han registrado documentos procesados por IA en el expediente abierto de este paciente.</p>
        </div>
    );

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
            {/* Left: Timeline List */}
            <div className="lg:col-span-4 bg-white rounded-2xl shadow-sm border border-slate-100 p-4 overflow-y-auto custom-scrollbar">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-emerald-500" />
                    Línea de Tiempo
                </h3>
                <div className="space-y-4">
                    {documentos.map((doc) => (
                        <div
                            key={doc.id}
                            onClick={() => setSelectedDoc(doc)}
                            className={`relative flex items-center justify-between cursor-pointer p-3 rounded-xl transition-all border ${selectedDoc?.id === doc.id ? 'bg-emerald-50 border-emerald-200 shadow-sm' : 'hover:bg-slate-50 border-transparent'}`}
                        >
                            <div className="flex items-center gap-4 w-full">
                                <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center shadow z-10 ${selectedDoc?.id === doc.id ? 'bg-emerald-500 text-white' : 'bg-white text-emerald-500 border-2 border-slate-100'}`}>
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`font-bold text-sm truncate ${selectedDoc?.id === doc.id ? 'text-emerald-800' : 'text-slate-700'}`}>{doc.tipo_documento}</p>
                                    <p className="text-xs text-slate-500">{new Date(doc.created_at).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Split View (PDF & JSONB) */}
            <div className="lg:col-span-8 bg-slate-100/50 rounded-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row h-full">
                {selectedDoc ? (
                    <>
                        {/* 50% Original File */}
                        {selectedDoc.archivo_url && (
                            <div className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-slate-200 bg-white">
                                {selectedDoc.archivo_url.toLowerCase().match(/\.(jpeg|jpg|gif|png|webp)$/) ? (
                                    <img src={selectedDoc.archivo_url} alt="Documento Original" className="w-full h-full object-contain p-2" />
                                ) : (
                                    <iframe src={`${selectedDoc.archivo_url}#toolbar=0`} className="w-full h-full" title="PDF Document" />
                                )}
                            </div>
                        )}

                        {/* 50% Extracted Data */}
                        <div className={`w-full ${selectedDoc.archivo_url ? 'md:w-1/2 h-1/2 md:h-full' : 'h-full'} p-4 overflow-hidden`}>
                            <DynamicDataViewer data={selectedDoc.datos_extraidos || {}} title={`Datos Extraídos: ${selectedDoc.tipo_documento}`} />
                        </div>
                    </>
                ) : (
                    <div className="flex w-full h-full items-center justify-center text-slate-400 font-medium pb-20">Selecciona un documento</div>
                )}
            </div>
        </div>
    );
}
