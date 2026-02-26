// =====================================================
// PÁGINA: Analizador de Documentos Médicos con IA
// GPMedical ERP Pro — Herramientas
// Analiza documentos subidos, extrae datos con Gemini
// y genera formatos estructurados para integrar con pacientes
// =====================================================

import React, { useState, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    UploadCloud, File as FileIcon, Download, FileText, CheckCircle, AlertCircle,
    Loader2, Play, Database, Brain, Sparkles, ArrowRight, X, Eye,
    FileSpreadsheet, Image as ImageIcon, FileType, Archive, Trash2,
    ChevronDown, ChevronUp, ZapIcon
} from 'lucide-react';
import { PremiumPageHeader } from '@/components/ui/PremiumPageHeader';
import { toast } from 'sonner';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import {
    analyzeDocument,
    determineCategory,
    isGeminiConfigured,
    type FileItem,
    type ExtractedDocumentData,
    type StructuredMedicalData
} from '@/services/geminiDocumentService';

// ── Iconos por categoría ──
const CATEGORY_ICONS: Record<string, any> = {
    'Documentos PDF': FileText,
    'Imágenes Médicas': ImageIcon,
    'Documentos de Word': FileType,
    'Presentaciones': FileSpreadsheet,
    'Archivos de Texto / Datos': FileSpreadsheet,
    'Otros Archivos': FileIcon,
};

const CATEGORY_COLORS: Record<string, string> = {
    'Documentos PDF': 'red',
    'Imágenes Médicas': 'blue',
    'Documentos de Word': 'indigo',
    'Presentaciones': 'orange',
    'Archivos de Texto / Datos': 'teal',
    'Otros Archivos': 'gray',
};

export default function AnalizadorDocumentos() {
    const [fileItems, setFileItems] = useState<FileItem[]>([]);
    const [isExpandingZip, setIsExpandingZip] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);

    const geminiReady = isGeminiConfigured();

    // ── ZIP Expansion ──
    const expandZipFiles = async (files: File[]): Promise<File[]> => {
        const allFiles: File[] = [];
        const JSZip = (await import('jszip')).default;

        for (const file of files) {
            if (file.type === 'application/zip' || file.name.toLowerCase().endsWith('.zip')) {
                try {
                    const zip = await JSZip.loadAsync(file);
                    const unzippedFiles = await Promise.all(
                        Object.values(zip.files).map(async (zipEntry) => {
                            if (!zipEntry.dir && !zipEntry.name.startsWith('__MACOSX') && !zipEntry.name.endsWith('.DS_Store')) {
                                const blob = await zipEntry.async('blob');
                                let mimeType = blob.type;
                                if (!mimeType) {
                                    if (zipEntry.name.endsWith('.pdf')) mimeType = 'application/pdf';
                                    else if (zipEntry.name.endsWith('.jpg') || zipEntry.name.endsWith('.jpeg')) mimeType = 'image/jpeg';
                                    else if (zipEntry.name.endsWith('.png')) mimeType = 'image/png';
                                    else if (zipEntry.name.endsWith('.docx')) mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                                    else if (zipEntry.name.endsWith('.csv')) mimeType = 'text/csv';
                                    else if (zipEntry.name.endsWith('.txt')) mimeType = 'text/plain';
                                }
                                return new File([blob], zipEntry.name.split('/').pop() || zipEntry.name, { type: mimeType });
                            }
                            return null;
                        })
                    );
                    allFiles.push(...unzippedFiles.filter((f): f is File => f !== null));
                } catch (e) {
                    console.error("Error descomprimiendo ZIP:", e);
                    allFiles.push(file);
                }
            } else {
                allFiles.push(file);
            }
        }
        return allFiles;
    };

    // ── Add Files ──
    const addFiles = async (newFiles: File[]) => {
        setIsExpandingZip(true);
        const expandedFiles = await expandZipFiles(newFiles);

        const newItems: FileItem[] = expandedFiles.map(f => ({
            id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
            file: f,
            status: 'pending',
            category: determineCategory(f)
        }));

        setFileItems(prev => [...prev, ...newItems]);
        setIsExpandingZip(false);
        toast.success(`${expandedFiles.length} archivo(s) añadidos al análisis`);
    };

    // ── Drag & Drop ──
    const handleFileDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        addFiles(Array.from(event.dataTransfer.files));
    }, []);

    const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        addFiles(Array.from(event.target.files || []));
        event.target.value = '';
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
    };

    // ── Extract text from PPTX ──
    const extractTextFromPptx = async (file: File): Promise<string> => {
        const JSZip = (await import('jszip')).default;
        const zip = await JSZip.loadAsync(file);
        let text = "";
        const slideFiles = Object.keys(zip.files).filter(name => name.match(/ppt\/slides\/slide\d+\.xml/));
        for (const slideName of slideFiles) {
            const slideContent = await zip.files[slideName].async('string');
            const slideText = slideContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            text += `--- Diapositiva ${slideName} ---\n${slideText}\n\n`;
        }
        if (!text) throw new Error("No se encontró texto en las diapositivas.");
        return text;
    };

    // ── Extract from PDF (render to images for Gemini vision) ──
    const extractFromPdf = async (file: File): Promise<{ text: string; images: File[] }> => {
        const pdfjsLib = await import('pdfjs-dist');
        // @ts-ignore
        const workerUrl = await import('pdfjs-dist/build/pdf.worker.mjs?url');
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl.default;

        const images: File[] = [];
        let textContent = '';
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

        const MAX_PAGES = 10;
        const pagesToProcess = Math.min(pdf.numPages, MAX_PAGES);

        for (let i = 1; i <= pagesToProcess; i++) {
            const page = await pdf.getPage(i);

            try {
                const text = await page.getTextContent();
                textContent += text.items.map(item => ('str' in item ? item.str : '')).join(' ') + '\n';
            } catch (e) {
                console.warn("No se pudo extraer texto de la página", i);
            }

            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            if (context) {
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                try {
                    // @ts-ignore - pdfjs-dist v5 types require canvas but canvasContext works at runtime
                    await page.render({ canvasContext: context, viewport, canvas } as any).promise;
                    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.6));
                    if (blob) {
                        images.push(new File([blob], `pdf_page_${i}.jpg`, { type: 'image/jpeg' }));
                    }
                } catch (e) {
                    console.error(`Error renderizando página ${i}:`, e);
                }
            }
        }

        if (pdf.numPages > MAX_PAGES) {
            textContent += `\n\n[Nota: El documento tiene ${pdf.numPages} páginas. Solo se analizaron las primeras ${MAX_PAGES}.]`;
        }

        return { text: textContent, images };
    };

    // ── Process single file ──
    const processFile = async (id: string) => {
        setFileItems(prev => prev.map(item => item.id === id ? { ...item, status: 'processing' } : item));

        const itemToProcess = fileItems.find(i => i.id === id);
        if (!itemToProcess) return;

        const file = itemToProcess.file;
        let rawText = '';
        let images: File[] = [];
        let fileType = file.type || 'unknown';
        let error: string | undefined = undefined;
        let structuredData: StructuredMedicalData | undefined = undefined;

        try {
            if (file.name.toLowerCase().endsWith('.zip')) {
                error = 'Archivo ZIP anidado. Descomprímalo antes de subirlo.';
                fileType = 'application/zip';
            } else if (file.type.startsWith('image/') || /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file.name)) {
                images = [file];
                fileType = 'image';
            } else if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
                const extracted = await extractFromPdf(file);
                rawText = extracted.text;
                images = extracted.images;
                fileType = 'pdf';
            } else if (file.name.toLowerCase().endsWith('.docx')) {
                const mammoth = (await import('mammoth')).default;
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer });
                rawText = result.value;
                fileType = 'docx';
            } else if (file.name.toLowerCase().endsWith('.pptx')) {
                rawText = await extractTextFromPptx(file);
                fileType = 'pptx';
            } else if (file.name.toLowerCase().endsWith('.ppt')) {
                error = 'El formato .ppt antiguo no está soportado. Guárdalo como .pptx.';
                fileType = 'ppt';
            } else if (file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv') || file.name.toLowerCase().endsWith('.xml') || file.name.toLowerCase().endsWith('.txt')) {
                rawText = await file.text();
                fileType = 'text';
            } else {
                error = `Formato no soportado: ${file.name}`;
                fileType = 'unknown';
            }

            if (!error) {
                structuredData = await analyzeDocument(rawText, images);
            }
        } catch (err: any) {
            console.error(`Error procesando ${file.name}:`, err);
            error = err.message || 'Error durante el análisis con IA.';
        }

        const result: ExtractedDocumentData = { fileName: file.name, fileType, rawText, structuredData, error };

        setFileItems(prev => prev.map(item =>
            item.id === id ? { ...item, status: error ? 'error' : 'completed', result } : item
        ));

        if (!error) {
            toast.success(`✅ ${file.name} analizado exitosamente`);
        } else {
            toast.error(`❌ Error en ${file.name}: ${error}`);
        }
    };

    // ── Process category ──
    const processCategory = async (category: string) => {
        const itemsToProcess = fileItems.filter(item => item.category === category && item.status !== 'completed');
        for (const item of itemsToProcess) {
            await processFile(item.id);
        }
    };

    // ── Process ALL ──
    const processAll = async () => {
        const pendingItems = fileItems.filter(i => i.status === 'pending' || i.status === 'error');
        for (const item of pendingItems) {
            await processFile(item.id);
        }
    };

    // ── Remove file ──
    const removeFile = (id: string) => {
        setFileItems(prev => prev.filter(i => i.id !== id));
    };

    // ── Clear all ──
    const clearAll = () => {
        setFileItems([]);
        setExpandedResults(new Set());
    };

    // ── Grouped Files ──
    const groupedFiles = useMemo(() => {
        const groups: Record<string, FileItem[]> = {};
        fileItems.forEach(item => {
            if (!groups[item.category]) groups[item.category] = [];
            groups[item.category].push(item);
        });
        return groups;
    }, [fileItems]);

    const completedResults = useMemo(() => {
        return fileItems.filter(i => i.status === 'completed' && i.result).map(i => i.result!);
    }, [fileItems]);

    const stats = useMemo(() => ({
        total: fileItems.length,
        pending: fileItems.filter(i => i.status === 'pending').length,
        processing: fileItems.filter(i => i.status === 'processing').length,
        completed: fileItems.filter(i => i.status === 'completed').length,
        errors: fileItems.filter(i => i.status === 'error').length,
    }), [fileItems]);

    // ── Toggle expanded result ──
    const toggleExpanded = (id: string) => {
        setExpandedResults(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    // ── Export CSV ──
    const exportToCsv = () => {
        if (completedResults.length === 0) return;
        const csvData: any[] = [];
        completedResults.forEach(item => {
            if (item.structuredData?.datos_estructurados && item.structuredData.datos_estructurados.length > 0) {
                item.structuredData.datos_estructurados.forEach(dato => {
                    csvData.push({
                        'Archivo': item.fileName,
                        'Paciente': item.structuredData?.paciente || '',
                        'Fecha': item.structuredData?.fecha || '',
                        'Tipo Documento': item.structuredData?.tipo_documento || '',
                        'Categoría': dato.categoria || '',
                        'Parámetro': dato.parametro || '',
                        'Resultado': dato.resultado || '',
                        'Unidad': dato.unidad || '',
                        'Rango Referencia': dato.rango_referencia || '',
                        'Observación': dato.observacion || '',
                        'Interpretación General': item.structuredData?.interpretacion_general || ''
                    });
                });
            }
        });

        const csv = Papa.unparse(csvData);
        const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `analisis_medico_${new Date().toISOString().slice(0, 10)}.csv`);
        toast.success('CSV exportado exitosamente');
    };

    // ── Export Markdown Report ──
    const exportToMarkdown = () => {
        if (completedResults.length === 0) return;

        let mdContent = `# Reporte de Análisis Médico — GP Medical Health\n\nGenerado: ${new Date().toLocaleString()}\n\n---\n\n`;

        completedResults.forEach((item, index) => {
            mdContent += `## ${index + 1}. ${item.fileName}\n\n`;
            if (item.error) {
                mdContent += `**Error:** ${item.error}\n\n---\n\n`;
                return;
            }
            if (item.structuredData) {
                const sd = item.structuredData;
                mdContent += `- **Paciente:** ${sd.paciente || 'N/D'}\n`;
                mdContent += `- **Fecha:** ${sd.fecha || 'N/D'}\n`;
                mdContent += `- **Tipo:** ${sd.tipo_documento || 'N/D'}\n\n`;
                if (sd.datos_estructurados?.length > 0) {
                    mdContent += `### Datos Clínicos\n\n`;
                    mdContent += `| Parámetro | Resultado | Unidad | Referencia | Obs. |\n`;
                    mdContent += `|---|---|---|---|---|\n`;
                    sd.datos_estructurados.forEach(d => {
                        mdContent += `| ${d.parametro} | **${d.resultado}** | ${d.unidad || '-'} | ${d.rango_referencia || '-'} | ${d.observacion || '-'} |\n`;
                    });
                    mdContent += `\n`;
                }
                if (sd.interpretacion_general) {
                    mdContent += `### Interpretación\n\n${sd.interpretacion_general}\n\n`;
                }
            }
            mdContent += `---\n\n`;
        });

        const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
        saveAs(blob, `reporte_medico_${new Date().toISOString().slice(0, 10)}.md`);
        toast.success('Reporte Markdown exportado');
    };

    // ── Export ERP Integration Instructions ──
    const exportCategoryForErp = (category: string) => {
        const categoryItems = fileItems.filter(i => i.category === category && i.status === 'completed' && i.result?.structuredData);
        if (categoryItems.length === 0) return;

        const payload = categoryItems.map(item => ({
            archivo_origen: item.result?.fileName,
            tipo_documento: item.result?.structuredData?.tipo_documento,
            paciente: item.result?.structuredData?.paciente,
            fecha: item.result?.structuredData?.fecha,
            datos_clinicos: item.result?.structuredData?.datos_estructurados,
            graficas: item.result?.structuredData?.datos_graficas,
            interpretacion: item.result?.structuredData?.interpretacion_general
        }));

        const mdContent = `# INSTRUCCIONES DE INTEGRACIÓN ERP — GP Medical Health
## Categoría: ${category}
Fecha de extracción: ${new Date().toLocaleString()}

---

### ⚠️ REGLA DE INTEGRACIÓN DINÁMICA

Procesa el siguiente payload JSON con datos médicos extraídos e intégralos al perfil del paciente en el ERP:

1. **Mapea e inserta** todos los datos en las tablas correspondientes.
2. **Si falta una tabla o columna**, créala dinámicamente.
3. **Ningún dato debe ser descartado.** La base de datos se adapta automáticamente.

---

### 📦 PAYLOAD JSON

\`\`\`json
${JSON.stringify(payload, null, 2)}
\`\`\`
`;

        const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8;' });
        saveAs(blob, `ERP_Instrucciones_${category.replace(/\s+/g, '_')}.md`);
        toast.success('Instrucciones ERP exportadas');
    };

    // ── Status badge component ──
    const StatusBadge = ({ status }: { status: FileItem['status'] }) => {
        const configs = {
            pending: { label: 'Pendiente', icon: null, cls: 'bg-gray-100 text-gray-500' },
            processing: { label: 'Analizando...', icon: Loader2, cls: 'bg-emerald-50 text-emerald-600' },
            completed: { label: 'Completado', icon: CheckCircle, cls: 'bg-emerald-100 text-emerald-700' },
            error: { label: 'Error', icon: AlertCircle, cls: 'bg-red-50 text-red-600' },
        };
        const c = configs[status];
        return (
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${c.cls}`}>
                {c.icon && <c.icon className={`w-3 h-3 ${status === 'processing' ? 'animate-spin' : ''}`} />}
                {c.label}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            <PremiumPageHeader
                title="Analizador de Documentos IA"
                subtitle="Extrae datos médicos de PDFs, imágenes, DOCX y ZIPs con inteligencia artificial"
                icon={Brain}
                badge="HERRAMIENTAS IA"
            />

            {/* ── API Key Warning ── */}
            {!geminiReady && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3"
                >
                    <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-bold text-amber-800 text-sm">API Key de Gemini no configurada</p>
                        <p className="text-xs text-amber-600 mt-1">
                            Agrega <code className="px-1 py-0.5 bg-amber-100 rounded text-amber-800 font-mono">VITE_GOOGLE_API_KEY</code> en
                            tu archivo <code className="px-1 py-0.5 bg-amber-100 rounded text-amber-800 font-mono">.env.local</code> para
                            activar el análisis con IA.
                        </p>
                    </div>
                </motion.div>
            )}

            {/* ── Stats Bar (when files loaded) ── */}
            {fileItems.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-4 flex items-center gap-4 flex-wrap"
                >
                    <div className="flex items-center gap-6 bg-white border border-gray-100 rounded-2xl px-5 py-3 shadow-sm flex-1">
                        {[
                            { label: 'Total', value: stats.total, color: 'text-gray-700' },
                            { label: 'Pendientes', value: stats.pending, color: 'text-gray-400' },
                            { label: 'Procesando', value: stats.processing, color: 'text-emerald-500' },
                            { label: 'Completados', value: stats.completed, color: 'text-emerald-600' },
                            { label: 'Errores', value: stats.errors, color: 'text-red-500' },
                        ].map(s => (
                            <div key={s.label} className="text-center">
                                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        {stats.pending > 0 && (
                            <button
                                onClick={processAll}
                                disabled={stats.processing > 0}
                                className="btn-premium px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50"
                            >
                                {stats.processing > 0 ? (
                                    <><Loader2 className="w-4 h-4 animate-spin" /> Procesando...</>
                                ) : (
                                    <><ZapIcon className="w-4 h-4" /> Procesar Todos ({stats.pending})</>
                                )}
                            </button>
                        )}
                        <button
                            onClick={clearAll}
                            className="px-4 py-2.5 rounded-xl text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all font-semibold"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}

            {/* ── Upload Zone ── */}
            <div className="px-4">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card rounded-[2rem] p-8"
                >
                    <div
                        className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 relative group
                            ${isDragging
                                ? 'border-emerald-500 bg-emerald-50/50 scale-[1.02]'
                                : 'border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/20'
                            }`}
                        onDrop={handleFileDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleFileInput}
                            accept=".pdf,.jpg,.jpeg,.png,.gif,.bmp,.webp,.docx,.doc,.pptx,.csv,.xml,.txt,.zip"
                        />

                        {isExpandingZip ? (
                            <div className="flex flex-col items-center text-emerald-600">
                                <Loader2 className="w-14 h-14 mb-4 animate-spin" />
                                <p className="font-bold text-lg">Descomprimiendo y leyendo archivos...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-5 transition-all duration-300
                                    ${isDragging
                                        ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
                                        : 'bg-gradient-to-br from-emerald-50 to-teal-50 group-hover:from-emerald-100 group-hover:to-teal-100'
                                    }`}>
                                    <UploadCloud className={`w-10 h-10 transition-colors ${isDragging ? 'text-white' : 'text-emerald-400 group-hover:text-emerald-500'}`} />
                                </div>
                                <p className="font-bold text-lg text-gray-800">
                                    Arrastra documentos médicos o un <span className="text-emerald-600">ZIP</span> aquí
                                </p>
                                <p className="text-sm text-gray-400 mt-1.5">
                                    o haz click para seleccionar archivos
                                </p>
                                <div className="flex flex-wrap justify-center gap-2 mt-5">
                                    {['PDF', 'JPG/PNG', 'DOCX', 'PPTX', 'CSV', 'ZIP'].map(ext => (
                                        <span key={ext} className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                            {ext}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* ── Files by Category ── */}
            <AnimatePresence>
                {fileItems.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="px-4 space-y-4"
                    >
                        <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                            <Archive className="w-5 h-5 text-emerald-500" />
                            Archivos Detectados
                        </h2>

                        <div className="space-y-4">
                            {Object.entries(groupedFiles).map(([category, items]) => {
                                const CategoryIcon = CATEGORY_ICONS[category] || FileIcon;
                                const pendingItems = items.filter(i => i.status !== 'completed');
                                const completedItems = items.filter(i => i.status === 'completed');
                                const isProcessing = items.some(i => i.status === 'processing');

                                return (
                                    <motion.div
                                        key={category}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="glass-card rounded-2xl p-5"
                                    >
                                        {/* Category Header */}
                                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3 border-b border-gray-100 pb-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center">
                                                    <CategoryIcon className="w-4.5 h-4.5 text-emerald-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">{category}</h3>
                                                    <p className="text-[10px] text-gray-400">{items.length} archivo(s)</p>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {pendingItems.length > 0 && (
                                                    <button
                                                        onClick={() => processCategory(category)}
                                                        disabled={isProcessing || !geminiReady}
                                                        className="btn-premium px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50"
                                                    >
                                                        {isProcessing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                                                        {isProcessing ? 'Procesando...' : `Procesar (${pendingItems.length})`}
                                                    </button>
                                                )}
                                                {completedItems.length > 0 && (
                                                    <button
                                                        onClick={() => exportCategoryForErp(category)}
                                                        className="px-4 py-2 rounded-xl text-xs font-bold bg-gray-900 text-white hover:bg-black transition-all flex items-center gap-1.5 shadow-sm"
                                                    >
                                                        <Database className="w-3.5 h-3.5" />
                                                        Instrucciones ERP
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* File List */}
                                        <ul className="space-y-2">
                                            {items.map(item => (
                                                <li
                                                    key={item.id}
                                                    className="flex flex-col sm:flex-row sm:items-center justify-between bg-white/60 p-3.5 rounded-xl border border-gray-100 hover:border-emerald-200 transition-all group"
                                                >
                                                    <div className="flex items-center overflow-hidden mb-2 sm:mb-0">
                                                        <FileIcon className="w-5 h-5 mr-3 text-emerald-400 flex-shrink-0" />
                                                        <div className="flex flex-col overflow-hidden">
                                                            <span className="text-sm font-semibold text-gray-700 truncate">{item.file.name}</span>
                                                            <span className="text-[10px] text-gray-400">{(item.file.size / 1024).toFixed(1)} KB</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 sm:ml-4 flex-shrink-0">
                                                        <StatusBadge status={item.status} />

                                                        {item.status === 'pending' && (
                                                            <button
                                                                onClick={() => processFile(item.id)}
                                                                disabled={!geminiReady}
                                                                className="text-xs font-bold bg-emerald-500 text-white px-4 py-1.5 rounded-lg hover:bg-emerald-600 transition-all disabled:opacity-50 active:scale-95"
                                                            >
                                                                Procesar
                                                            </button>
                                                        )}

                                                        {item.status === 'error' && (
                                                            <button
                                                                onClick={() => processFile(item.id)}
                                                                disabled={!geminiReady}
                                                                className="text-xs font-bold bg-amber-500 text-white px-4 py-1.5 rounded-lg hover:bg-amber-600 transition-all disabled:opacity-50"
                                                            >
                                                                Reintentar
                                                            </button>
                                                        )}

                                                        <button
                                                            onClick={() => removeFile(item.id)}
                                                            className="p-1.5 text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Results Section ── */}
            <AnimatePresence>
                {completedResults.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="px-4 space-y-4"
                    >
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-gray-900">Resultados Estructurados</h2>
                                    <p className="text-xs text-gray-400">{completedResults.length} archivo(s) procesado(s) con IA</p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={exportToCsv}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl hover:bg-emerald-100 font-bold text-xs transition-all shadow-sm"
                                >
                                    <Download className="w-4 h-4" />
                                    CSV
                                </button>
                                <button
                                    onClick={exportToMarkdown}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black font-bold text-xs transition-all shadow-sm"
                                >
                                    <FileText className="w-4 h-4" />
                                    Reporte MD
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {completedResults.map((data, index) => {
                                const itemId = `result-${index}`;
                                const isExpanded = expandedResults.has(itemId);

                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="glass-card rounded-2xl overflow-hidden"
                                    >
                                        {/* Result Header */}
                                        <button
                                            onClick={() => toggleExpanded(itemId)}
                                            className="w-full flex items-center justify-between p-5 hover:bg-emerald-50/30 transition-colors"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                                                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                                                </div>
                                                <div className="text-left">
                                                    <h3 className="font-bold text-gray-800 text-sm">{data.fileName}</h3>
                                                    <div className="flex items-center gap-3 mt-0.5">
                                                        <span className="text-[10px] text-gray-400 font-mono uppercase">{data.fileType}</span>
                                                        {data.structuredData?.paciente && (
                                                            <span className="text-[10px] text-emerald-600 font-bold">👤 {data.structuredData.paciente}</span>
                                                        )}
                                                        {data.structuredData?.fecha && (
                                                            <span className="text-[10px] text-gray-400">📅 {data.structuredData.fecha}</span>
                                                        )}
                                                        {data.structuredData?.datos_estructurados && (
                                                            <span className="text-[10px] text-gray-400">{data.structuredData.datos_estructurados.length} parámetros</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                        </button>

                                        {/* Result Body */}
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
                                                        {data.error ? (
                                                            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                                                <p className="text-sm text-red-600">{data.error}</p>
                                                            </div>
                                                        ) : data.structuredData ? (
                                                            <>
                                                                {/* Patient Info */}
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                                    {[
                                                                        { label: 'Paciente', value: data.structuredData.paciente },
                                                                        { label: 'Fecha', value: data.structuredData.fecha },
                                                                        { label: 'Tipo de Documento', value: data.structuredData.tipo_documento },
                                                                    ].map(({ label, value }) => (
                                                                        <div key={label} className="bg-gray-50 rounded-xl p-3">
                                                                            <span className="text-[10px] text-gray-400 uppercase tracking-wider block mb-1 font-bold">{label}</span>
                                                                            <span className="text-sm font-bold text-gray-800">{value || 'N/D'}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                {/* Data Table */}
                                                                {data.structuredData.datos_estructurados?.length > 0 && (
                                                                    <div>
                                                                        <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                                            <FileText className="w-3.5 h-3.5 text-emerald-500" />
                                                                            Datos Clínicos Extraídos ({data.structuredData.datos_estructurados.length})
                                                                        </h4>
                                                                        <div className="overflow-x-auto border border-gray-200 rounded-xl">
                                                                            <table className="min-w-full text-sm text-left text-gray-600">
                                                                                <thead className="text-[10px] text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                                                                                    <tr>
                                                                                        <th className="px-3 py-2.5">Categoría</th>
                                                                                        <th className="px-3 py-2.5">Parámetro</th>
                                                                                        <th className="px-3 py-2.5">Resultado</th>
                                                                                        <th className="px-3 py-2.5">Unidad</th>
                                                                                        <th className="px-3 py-2.5">Referencia</th>
                                                                                        <th className="px-3 py-2.5">Obs.</th>
                                                                                    </tr>
                                                                                </thead>
                                                                                <tbody className="divide-y divide-gray-100">
                                                                                    {data.structuredData.datos_estructurados.map((row, i) => (
                                                                                        <tr key={i} className="hover:bg-emerald-50/30 transition-colors">
                                                                                            <td className="px-3 py-2 text-[10px] text-gray-400">{row.categoria || '-'}</td>
                                                                                            <td className="px-3 py-2 font-semibold text-gray-800 text-xs">{row.parametro}</td>
                                                                                            <td className="px-3 py-2 font-black text-emerald-600 text-xs">{row.resultado}</td>
                                                                                            <td className="px-3 py-2 text-xs">{row.unidad || '-'}</td>
                                                                                            <td className="px-3 py-2 text-[10px] text-gray-400">{row.rango_referencia || '-'}</td>
                                                                                            <td className="px-3 py-2 text-[10px]">{row.observacion || '-'}</td>
                                                                                        </tr>
                                                                                    ))}
                                                                                </tbody>
                                                                            </table>
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Graph Data */}
                                                                {data.structuredData.datos_graficas && data.structuredData.datos_graficas.length > 0 && (
                                                                    <div>
                                                                        <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-2">
                                                                            <Eye className="w-3.5 h-3.5 text-blue-500" />
                                                                            Datos de Gráficas Extraídos
                                                                        </h4>
                                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                                            {data.structuredData.datos_graficas.map((grafica, gIdx) => (
                                                                                <div key={gIdx} className="border border-gray-200 rounded-xl p-4 bg-white">
                                                                                    <h5 className="font-bold text-emerald-600 text-xs mb-2">{grafica.titulo || 'Gráfica'}</h5>
                                                                                    <div className="flex justify-between text-[10px] text-gray-400 mb-2">
                                                                                        <span><strong>X:</strong> {grafica.eje_x_label || 'N/D'}</span>
                                                                                        <span><strong>Y:</strong> {grafica.eje_y_label || 'N/D'}</span>
                                                                                    </div>
                                                                                    {grafica.puntos && grafica.puntos.length > 0 && (
                                                                                        <div className="max-h-36 overflow-y-auto border border-gray-100 rounded-lg custom-scrollbar">
                                                                                            <table className="min-w-full text-[10px] text-left text-gray-600">
                                                                                                <thead className="bg-gray-50 sticky top-0">
                                                                                                    <tr>
                                                                                                        <th className="px-2 py-1.5 font-bold">{grafica.eje_x_label || 'X'}</th>
                                                                                                        <th className="px-2 py-1.5 font-bold">{grafica.eje_y_label || 'Y'}</th>
                                                                                                    </tr>
                                                                                                </thead>
                                                                                                <tbody className="divide-y divide-gray-50">
                                                                                                    {grafica.puntos.map((p, pIdx) => (
                                                                                                        <tr key={pIdx}>
                                                                                                            <td className="px-2 py-1">{p.x}</td>
                                                                                                            <td className="px-2 py-1 font-semibold">{p.y}</td>
                                                                                                        </tr>
                                                                                                    ))}
                                                                                                </tbody>
                                                                                            </table>
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {/* Interpretation */}
                                                                {data.structuredData.interpretacion_general && (
                                                                    <div>
                                                                        <h4 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-2">
                                                                            Interpretación General
                                                                        </h4>
                                                                        <div className="p-4 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-xl border border-emerald-100">
                                                                            <p className="text-sm text-gray-700 leading-relaxed">
                                                                                {data.structuredData.interpretacion_general}
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <p className="text-sm text-gray-400 italic p-4 bg-gray-50 rounded-xl">
                                                                Sin datos estructurados identificables.
                                                            </p>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
